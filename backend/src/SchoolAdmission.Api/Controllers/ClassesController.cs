using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;
using SchoolAdmission.Api.Validators;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;
    private readonly IHoldService _holdService;

    public ClassesController(IClassService classService, IHoldService holdService)
    {
        _classService = classService;
        _holdService = holdService;
    }

    [HttpPost]
    public async Task<ActionResult<ClassResponse>> CreateClass(
        [FromBody] CreateClassRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _classService.CreateClassAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetClassById), new { classId = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<List<ClassDetailResponse>>> GetClasses(CancellationToken cancellationToken)
    {
        var classes = await _classService.GetAllClassesAsync(cancellationToken);
        return Ok(classes);
    }

    [HttpGet("{classId}")]
    public async Task<ActionResult<ClassDetailResponse>> GetClassById(
        string classId,
        CancellationToken cancellationToken)
    {
        var classDetail = await _classService.GetClassByIdAsync(classId, cancellationToken);
        return Ok(classDetail);
    }

    [HttpPost("{classId}/holds")]
    public async Task<ActionResult<CreateHoldResponse>> CreateHold(
        string classId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var studentId = StudentIdValidator.Validate(studentIdHeader);
        var response = await _holdService.CreateHoldAsync(classId, studentId, cancellationToken);
        return Created($"/holds/{response.HoldId}", response);
    }
}
