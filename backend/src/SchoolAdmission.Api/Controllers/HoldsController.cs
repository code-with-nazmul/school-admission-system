using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;
using SchoolAdmission.Api.Validators;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("holds")]
public class HoldsController : ControllerBase
{
    private readonly IHoldService _holdService;

    public HoldsController(IHoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpGet("{holdId}")]
    public async Task<ActionResult<HoldStatusResponse>> GetHoldById(
        string holdId,
        CancellationToken cancellationToken)
    {
        var response = await _holdService.GetHoldByIdAsync(holdId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{holdId}/confirm")]
    public async Task<ActionResult<ConfirmHoldResponse>> ConfirmHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var studentId = StudentIdValidator.Validate(studentIdHeader);
        var response = await _holdService.ConfirmHoldAsync(holdId, studentId, cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{holdId}")]
    public async Task<IActionResult> CancelHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var studentId = StudentIdValidator.Validate(studentIdHeader);
        await _holdService.CancelHoldAsync(holdId, studentId, cancellationToken);
        return NoContent();
    }
}

