using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;
using SchoolAdmission.Api.Validators;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("me")]
public class MeController : ControllerBase
{
    private readonly IHoldService _holdService;

    public MeController(IHoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpGet("holds")]
    public async Task<ActionResult<List<StudentHoldResponse>>> GetMyHolds(
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var studentId = StudentIdValidator.Validate(studentIdHeader);
        var response = await _holdService.GetStudentHoldsAsync(studentId, cancellationToken);
        return Ok(response);
    }
}

