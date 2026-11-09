namespace SchoolAdmission.Api.Data.Entities;

public class ClassEntity
{
    public string Id { get; set; } = string.Empty;
    public int SequenceNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TotalSeats { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<HoldEntity> Holds { get; set; } = new List<HoldEntity>();
}

