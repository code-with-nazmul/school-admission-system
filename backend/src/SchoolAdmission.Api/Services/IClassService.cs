using SchoolAdmission.Api.DTOs;

namespace SchoolAdmission.Api.Services;

public interface IClassService
{
    Task<ClassResponse> CreateClassAsync(CreateClassRequest request, CancellationToken cancellationToken = default);
    Task<List<ClassDetailResponse>> GetAllClassesAsync(CancellationToken cancellationToken = default);
    Task<ClassDetailResponse> GetClassByIdAsync(string classId, CancellationToken cancellationToken = default);
}

