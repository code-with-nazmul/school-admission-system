using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;

namespace SchoolAdmission.Api.Services;

public class IdGenerator : IIdGenerator
{
    private readonly SchoolAdmissionDbContext _context;

    public IdGenerator(SchoolAdmissionDbContext context)
    {
        _context = context;
    }

    public async Task<string> NextClassIdAsync(CancellationToken cancellationToken = default)
    {
        int seq;
        if (_context.Database.IsNpgsql())
        {
            try
            {
                seq = await _context.Database
                    .SqlQueryRaw<int>("SELECT nextval('class_seq')::int AS \"Value\"")
                    .FirstAsync(cancellationToken);
            }
            catch
            {
                // Ensure sequence exists if not yet created by migrations
                await _context.Database.ExecuteSqlRawAsync("CREATE SEQUENCE IF NOT EXISTS class_seq START 1;", cancellationToken);
                seq = await _context.Database
                    .SqlQueryRaw<int>("SELECT nextval('class_seq')::int AS \"Value\"")
                    .FirstAsync(cancellationToken);
            }
        }
        else
        {
            var count = await _context.Classes.CountAsync(cancellationToken);
            seq = count + 1;
        }

        return $"c_{seq:D3}";
    }

    public async Task<string> NextHoldIdAsync(CancellationToken cancellationToken = default)
    {
        int seq;
        if (_context.Database.IsNpgsql())
        {
            try
            {
                seq = await _context.Database
                    .SqlQueryRaw<int>("SELECT nextval('hold_seq')::int AS \"Value\"")
                    .FirstAsync(cancellationToken);
            }
            catch
            {
                // Ensure sequence exists if not yet created by migrations
                await _context.Database.ExecuteSqlRawAsync("CREATE SEQUENCE IF NOT EXISTS hold_seq START 1;", cancellationToken);
                seq = await _context.Database
                    .SqlQueryRaw<int>("SELECT nextval('hold_seq')::int AS \"Value\"")
                    .FirstAsync(cancellationToken);
            }
        }
        else
        {
            var count = await _context.Holds.CountAsync(cancellationToken);
            seq = count + 1;
        }

        return $"h_{seq:D3}";
    }
}

