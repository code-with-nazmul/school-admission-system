using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Data.Entities;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Exceptions;

namespace SchoolAdmission.Api.Services;

public class ClassService : IClassService
{
    private readonly SchoolAdmissionDbContext _context;
    private readonly IIdGenerator _idGenerator;

    public ClassService(SchoolAdmissionDbContext context, IIdGenerator idGenerator)
    {
        _context = context;
        _idGenerator = idGenerator;
    }

    public async Task<ClassResponse> CreateClassAsync(CreateClassRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("Class name is required.");
        }

        if (request.TotalSeats <= 0)
        {
            throw new ValidationException("Total seats must be greater than 0.");
        }

        var classId = await _idGenerator.NextClassIdAsync(cancellationToken);

        var classEntity = new ClassEntity
        {
            Id = classId,
            Name = request.Name.Trim(),
            TotalSeats = request.TotalSeats,
            HoldDurationSeconds = request.HoldDurationSeconds > 0 ? request.HoldDurationSeconds : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.Classes.Add(classEntity);
        await _context.SaveChangesAsync(cancellationToken);

        return new ClassResponse
        {
            Id = classEntity.Id,
            Name = classEntity.Name,
            TotalSeats = classEntity.TotalSeats,
            HoldDurationSeconds = classEntity.HoldDurationSeconds
        };
    }

    public async Task<List<ClassDetailResponse>> GetAllClassesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var list = await _context.Classes
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.TotalSeats,
                c.HoldDurationSeconds,
                ConfirmedSeats = c.Holds.Count(h => h.Status == HoldStatus.Confirmed),
                HeldSeats = c.Holds.Count(h => h.Status == HoldStatus.Held && h.ExpiresAt > now)
            })
            .ToListAsync(cancellationToken);

        return list.Select(c => new ClassDetailResponse
        {
            Id = c.Id,
            Name = c.Name,
            TotalSeats = c.TotalSeats,
            HoldDurationSeconds = c.HoldDurationSeconds,
            HeldSeats = c.HeldSeats,
            ConfirmedSeats = c.ConfirmedSeats,
            AvailableSeats = Math.Max(0, c.TotalSeats - (c.ConfirmedSeats + c.HeldSeats))
        }).ToList();
    }

    public async Task<ClassDetailResponse> GetClassByIdAsync(string classId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var classData = await _context.Classes
            .AsNoTracking()
            .Where(c => c.Id == classId)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.TotalSeats,
                c.HoldDurationSeconds,
                ConfirmedSeats = c.Holds.Count(h => h.Status == HoldStatus.Confirmed),
                HeldSeats = c.Holds.Count(h => h.Status == HoldStatus.Held && h.ExpiresAt > now)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (classData == null)
        {
            throw new NotFoundException($"Class with ID '{classId}' was not found.");
        }

        return new ClassDetailResponse
        {
            Id = classData.Id,
            Name = classData.Name,
            TotalSeats = classData.TotalSeats,
            HoldDurationSeconds = classData.HoldDurationSeconds,
            HeldSeats = classData.HeldSeats,
            ConfirmedSeats = classData.ConfirmedSeats,
            AvailableSeats = Math.Max(0, classData.TotalSeats - (classData.ConfirmedSeats + classData.HeldSeats))
        };
    }
}

