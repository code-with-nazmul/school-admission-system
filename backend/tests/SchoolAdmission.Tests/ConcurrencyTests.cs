using System.Collections.Concurrent;
using SchoolAdmission.Api.Exceptions;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Tests;

public class ConcurrencyTests
{
    [Fact]
    public async Task ConcurrentHoldRequests_NeverExceedTotalSeats_StrictlyEnforcesRule1()
    {
        // Arrange
        const int totalSeats = 5;
        const int totalApplicants = 40;

        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);
        var holdService = new HoldService(context, idGenerator, config);

        var cls = await classService.CreateClassAsync(new()
        {
            Name = "Class 6 - Morning Shift",
            TotalSeats = totalSeats
        });

        var successfulHolds = new ConcurrentBag<string>();
        var conflictExceptions = new ConcurrentBag<ConflictException>();
        var unexpectedExceptions = new ConcurrentBag<Exception>();

        // Generate 40 unique 17-digit student IDs
        var applicantIds = Enumerable.Range(1, totalApplicants)
            .Select(i => i.ToString("D17"))
            .ToList();

        // Act: Fire all 40 hold requests concurrently
        var tasks = applicantIds.Select(async studentId =>
        {
            try
            {
                var hold = await holdService.CreateHoldAsync(cls.Id, studentId);
                successfulHolds.Add(hold.HoldId);
            }
            catch (ConflictException ex)
            {
                conflictExceptions.Add(ex);
            }
            catch (Exception ex)
            {
                unexpectedExceptions.Add(ex);
            }
        });

        await Task.WhenAll(tasks);

        // Assert
        Assert.Empty(unexpectedExceptions);
        Assert.Equal(totalSeats, successfulHolds.Count);
        Assert.Equal(totalApplicants - totalSeats, conflictExceptions.Count);

        var classDetail = await classService.GetClassByIdAsync(cls.Id);
        Assert.Equal(totalSeats, classDetail.HeldSeats);
        Assert.Equal(0, classDetail.AvailableSeats);
        Assert.True(classDetail.HeldSeats + classDetail.ConfirmedSeats <= totalSeats);
    }
}

