namespace SchoolAdmission.Api.Data.Entities;

public class HoldEntity
{
    public string Id { get; set; } = string.Empty;
    public int SequenceNumber { get; set; }
    public string ClassId { get; set; } = string.Empty;
    public ClassEntity? Class { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Status { get; set; } = HoldStatus.Held;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

