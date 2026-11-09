using SchoolAdmission.Api.Data.Entities;
using SchoolAdmission.Api.Exceptions;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Tests;

public class HoldServiceTests
{
    private const string Student1 = "00000000000000001";
    private const string Student2 = "00000000000000002";

    [Fact]
    public async Task CreateHold_ValidRequest_CreatesHoldWithHeldStatus()
    {
        // Arrange
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);
        var holdService = new HoldService(context, idGenerator, config);

        var cls = await classService.CreateClassAsync(new() { Name = "Class 6 - Morning", TotalSeats = 50 });

        // Act
        var hold = await holdService.CreateHoldAsync(cls.Id, Student1);

        // Assert
        Assert.NotNull(hold);
        Assert.Equal("h_001", hold.HoldId);
        Assert.Equal(cls.Id, hold.ClassId);
        Assert.Equal(Student1, hold.StudentId);
        Assert.Equal(HoldStatus.Held, hold.Status);
        Assert.True(hold.ExpiresAt > DateTime.UtcNow.AddSeconds(590));
    }

    [Fact]
    public async Task CreateHold_StudentAlreadyHasActiveHoldInSameClass_ThrowsValidationException()
    {
        // Arrange (Rule 3)
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);
        var holdService = new HoldService(context, idGenerator, config);

        var cls = await classService.CreateClassAsync(new() { Name = "Class 6 - Morning", TotalSeats = 50 });
        await holdService.CreateHoldAsync(cls.Id, Student1);

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => holdService.CreateHoldAsync(cls.Id, Student1));
    }

    [Fact]
    public async Task ConfirmHold_ValidOwnerAndUnexpired_TransitionsToConfirmed()
    {
        // Arrange (Rule 4)
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);
        var holdService = new HoldService(context, idGenerator, config);

        var cls = await classService.CreateClassAsync(new() { Name = "Class 6 - Morning", TotalSeats = 50 });
        var hold = await holdService.CreateHoldAsync(cls.Id, Student1);

        // Act
        var result = await holdService.ConfirmHoldAsync(hold.HoldId, Student1);

        // Assert
        Assert.Equal(HoldStatus.Confirmed, result.Status);

        var updated = await holdService.GetHoldByIdAsync(hold.HoldId);
        Assert.Equal(HoldStatus.Confirmed, updated.Status);
    }

    [Fact]
    public async Task ConfirmHold_CalledMultipleTimes_IsIdempotent()
    {
        // Arrange (Rule 5)
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);
        var holdService = new HoldService(context, idGenerator, config);

        var cls = await classService.CreateClassAsync(new() { Name = "Class 6 - Morning", TotalSeats = 50 });
        var hold = await holdService.CreateHoldAsync(cls.Id, Student1);

        // Act
        var first = await holdService.ConfirmHoldAsync(hold.HoldId, Student1);
        var second = await holdService.ConfirmHoldAsync(hold.HoldId, Student1);

        // Assert
        Assert.Equal(HoldStatus.Confirmed, first.Status);
        Assert.Equal(HoldStatus.Confirmed, second.Status);

        var classDetail = await classService.GetClassByIdAsync(cls.Id);
        Assert.Equal(1, classDetail.ConfirmedSeats); // Exactly 1 confirmed seat
    }

    [Fact]
    public async Task ConfirmHold_ByDifferentStudent_ThrowsForbiddenException()
    {
        // Arrange (Rule 4)
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);
        var holdService = new HoldService(context, idGenerator, config);

        var cls = await classService.CreateClassAsync(new() { Name = "Class 6 - Morning", TotalSeats = 50 });
        var hold = await holdService.CreateHoldAsync(cls.Id, Student1);

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenException>(() => holdService.ConfirmHoldAsync(hold.HoldId, Student2));
    }

    [Fact]
    public async Task ExpiredHold_ReturnsSeatToAvailablePoolImmediately()
    {
        // Arrange (Rule 2)
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var config = TestHelpers.CreateMockConfiguration(600);
        var classService = new ClassService(context, idGenerator);

        var cls = await classService.CreateClassAsync(new() { Name = "Class 6 - Morning", TotalSeats = 10 });

        // Insert a hold that expired 1 minute ago
        context.Holds.Add(new HoldEntity
        {
            Id = "h_999",
            ClassId = cls.Id,
            StudentId = Student1,
            Status = HoldStatus.Held,
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1),
            CreatedAt = DateTime.UtcNow.AddMinutes(-11),
            UpdatedAt = DateTime.UtcNow.AddMinutes(-11)
        });
        await context.SaveChangesAsync();

        // Act
        var classDetail = await classService.GetClassByIdAsync(cls.Id);

        // Assert: The expired hold is not counted as held!
        Assert.Equal(0, classDetail.HeldSeats);
        Assert.Equal(10, classDetail.AvailableSeats);
    }
}

