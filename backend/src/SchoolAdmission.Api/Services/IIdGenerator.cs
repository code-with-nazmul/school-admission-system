namespace SchoolAdmission.Api.Services;

public interface IIdGenerator
{
    Task<string> NextClassIdAsync(CancellationToken cancellationToken = default);
    Task<string> NextHoldIdAsync(CancellationToken cancellationToken = default);
}

