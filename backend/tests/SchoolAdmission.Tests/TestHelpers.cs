using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Tests;

public static class TestHelpers
{
    public static SchoolAdmissionDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<SchoolAdmissionDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SchoolAdmissionDbContext(options);
    }

    public static IConfiguration CreateMockConfiguration(int holdDurationSeconds = 600)
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "HoldDurationSeconds", holdDurationSeconds.ToString() }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }
}

