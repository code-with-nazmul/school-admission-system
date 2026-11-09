using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Data.Entities;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Exceptions;

namespace SchoolAdmission.Api.Services;

public class HoldService : IHoldService
{
    private static readonly SemaphoreSlim _nonNpgsqlLock = new(1, 1);
    private readonly SchoolAdmissionDbContext _context;
    private readonly IIdGenerator _idGenerator;
    private readonly IConfiguration _configuration;

    public HoldService(
        SchoolAdmissionDbContext context,
        IIdGenerator idGenerator,
        IConfiguration configuration)
    {
        _context = context;
        _idGenerator = idGenerator;
        _configuration = configuration;
    }

    private int GetHoldDurationSeconds()
    {
        var envValue = Environment.GetEnvironmentVariable("HOLD_DURATION_SECONDS");
        if (int.TryParse(envValue, out var parsed) && parsed > 0)
        {
            return parsed;
        }

        return _configuration.GetValue<int>("HoldDurationSeconds", 600);
    }

    public async Task<CreateHoldResponse> CreateHoldAsync(
        string classId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var durationSeconds = GetHoldDurationSeconds();
        var expiresAt = now.AddSeconds(durationSeconds);

        var isNpgsql = _context.Database.IsNpgsql();
        if (!isNpgsql)
        {
            await _nonNpgsqlLock.WaitAsync(cancellationToken);
        }

        try
        {
            await using var transaction = isNpgsql
                ? await _context.Database.BeginTransactionAsync(cancellationToken)
                : null;

            // Pessimistic Row Lock on the class to prevent race conditions (Rule 1 & Bonus 2.6)
            ClassEntity? classEntity;
            if (isNpgsql)
            {
                classEntity = await _context.Classes
                    .FromSqlInterpolated($"SELECT * FROM classes WHERE id = {classId} FOR UPDATE")
                    .FirstOrDefaultAsync(cancellationToken);
            }
            else
            {
                classEntity = await _context.Classes
                    .FirstOrDefaultAsync(c => c.Id == classId, cancellationToken);
            }

            if (classEntity == null)
            {
                throw new NotFoundException($"Class with ID '{classId}' was not found.");
            }

            // Rule 3: Single active application or confirmed admission per class
            var hasActiveApplication = await _context.Holds
                .AnyAsync(h => h.ClassId == classId &&
                               h.StudentId == studentId &&
                               (h.Status == HoldStatus.Confirmed ||
                               (h.Status == HoldStatus.Held && h.ExpiresAt > now)),
                               cancellationToken);

            if (hasActiveApplication)
            {
                throw new ValidationException("You already have an active application or confirmed admission for this class.");
            }

            // Rule 1: Count active seats under the exclusive row lock
            var confirmedCount = await _context.Holds
                .CountAsync(h => h.ClassId == classId && h.Status == HoldStatus.Confirmed, cancellationToken);

            var heldCount = await _context.Holds
                .CountAsync(h => h.ClassId == classId && h.Status == HoldStatus.Held && h.ExpiresAt > now, cancellationToken);

            if (confirmedCount + heldCount >= classEntity.TotalSeats)
            {
                throw new ConflictException("No available seats in this class.");
            }

            var holdId = await _idGenerator.NextHoldIdAsync(cancellationToken);

            var hold = new HoldEntity
            {
                Id = holdId,
                ClassId = classId,
                StudentId = studentId,
                Status = HoldStatus.Held,
                ExpiresAt = expiresAt,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Holds.Add(hold);
            await _context.SaveChangesAsync(cancellationToken);

            if (transaction != null)
            {
                await transaction.CommitAsync(cancellationToken);
            }

            return new CreateHoldResponse
            {
                HoldId = hold.Id,
                ClassId = hold.ClassId,
                StudentId = hold.StudentId,
                Status = hold.Status,
                ExpiresAt = hold.ExpiresAt
            };
        }
        finally
        {
            if (!isNpgsql)
            {
                _nonNpgsqlLock.Release();
            }
        }
    }

    public async Task<HoldStatusResponse> GetHoldByIdAsync(string holdId, CancellationToken cancellationToken = default)
    {
        var hold = await _context.Holds
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundException($"Hold with ID '{holdId}' was not found.");
        }

        var status = hold.Status;
        if (status == HoldStatus.Held && hold.ExpiresAt <= DateTime.UtcNow)
        {
            status = HoldStatus.Expired;
        }

        return new HoldStatusResponse
        {
            HoldId = hold.Id,
            ClassId = hold.ClassId,
            Status = status,
            ExpiresAt = hold.ExpiresAt
        };
    }

    public async Task<ConfirmHoldResponse> ConfirmHoldAsync(
        string holdId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var hold = await _context.Holds
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundException($"Hold with ID '{holdId}' was not found.");
        }

        // Rule 4: Ownership check
        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("You can only confirm your own application.");
        }

        // Rule 5: Idempotency check
        if (hold.Status == HoldStatus.Confirmed)
        {
            return new ConfirmHoldResponse
            {
                HoldId = hold.Id,
                Status = HoldStatus.Confirmed
            };
        }

        // Rule 4: Must be unexpired and in HELD status
        if (hold.Status == HoldStatus.Cancelled)
        {
            throw new ValidationException("Cancelled application cannot be confirmed.");
        }

        if (hold.Status == HoldStatus.Expired || (hold.Status == HoldStatus.Held && hold.ExpiresAt <= now))
        {
            hold.Status = HoldStatus.Expired;
            hold.UpdatedAt = now;
            await _context.SaveChangesAsync(cancellationToken);
            throw new ValidationException("Application has expired and cannot be confirmed.");
        }

        hold.Status = HoldStatus.Confirmed;
        hold.UpdatedAt = now;
        await _context.SaveChangesAsync(cancellationToken);

        return new ConfirmHoldResponse
        {
            HoldId = hold.Id,
            Status = HoldStatus.Confirmed
        };
    }

    public async Task CancelHoldAsync(
        string holdId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        var hold = await _context.Holds
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundException($"Hold with ID '{holdId}' was not found.");
        }

        // Ownership check
        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("You can only cancel your own application.");
        }

        if (hold.Status == HoldStatus.Cancelled)
        {
            return;
        }

        if (hold.Status == HoldStatus.Confirmed)
        {
            throw new ValidationException("Confirmed admission cannot be cancelled.");
        }

        hold.Status = HoldStatus.Cancelled;
        hold.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<StudentHoldResponse>> GetStudentHoldsAsync(
        string studentId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var holds = await _context.Holds
            .AsNoTracking()
            .Include(h => h.Class)
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(cancellationToken);

        return holds.Select(h =>
        {
            var status = h.Status;
            if (status == HoldStatus.Held && h.ExpiresAt <= now)
            {
                status = HoldStatus.Expired;
            }

            return new StudentHoldResponse
            {
                HoldId = h.Id,
                ClassId = h.ClassId,
                ClassName = h.Class?.Name ?? string.Empty,
                Status = status,
                ExpiresAt = h.ExpiresAt
            };
        }).ToList();
    }
}

