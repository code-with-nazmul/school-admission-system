using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService)
    {
        _classService = classService;
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
}

