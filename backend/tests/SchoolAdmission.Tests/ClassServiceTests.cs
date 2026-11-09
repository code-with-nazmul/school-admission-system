using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Exceptions;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Tests;

public class ClassServiceTests
{
    [Fact]
    public async Task CreateClass_WithValidInput_CreatesClassAndReturnsFormattedId()
    {
        // Arrange
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var classService = new ClassService(context, idGenerator);

        var request = new CreateClassRequest
        {
            Name = "Class 6 - Morning Shift",
            TotalSeats = 120
        };

        // Act
        var result = await classService.CreateClassAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("c_001", result.Id);
        Assert.Equal("Class 6 - Morning Shift", result.Name);
        Assert.Equal(120, result.TotalSeats);

        var inDb = await context.Classes.FindAsync("c_001");
        Assert.NotNull(inDb);
        Assert.Equal(120, inDb.TotalSeats);
    }

    [Theory]
    [InlineData("", 100)]
    [InlineData("   ", 100)]
    [InlineData("Class 6", 0)]
    [InlineData("Class 6", -5)]
    public async Task CreateClass_WithInvalidInput_ThrowsValidationException(string name, int totalSeats)
    {
        // Arrange
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var classService = new ClassService(context, idGenerator);

        var request = new CreateClassRequest { Name = name, TotalSeats = totalSeats };

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => classService.CreateClassAsync(request));
    }

    [Fact]
    public async Task GetClassById_NonExistentClass_ThrowsNotFoundException()
    {
        // Arrange
        using var context = TestHelpers.CreateInMemoryDbContext();
        var idGenerator = new IdGenerator(context);
        var classService = new ClassService(context, idGenerator);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => classService.GetClassByIdAsync("c_999"));
    }
}

