using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data.Entities;

namespace SchoolAdmission.Api.Data;

public class SchoolAdmissionDbContext : DbContext
{
    public SchoolAdmissionDbContext(DbContextOptions<SchoolAdmissionDbContext> options)
        : base(options)
    {
    }

    public DbSet<ClassEntity> Classes => Set<ClassEntity>();
    public DbSet<HoldEntity> Holds => Set<HoldEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasSequence<int>("class_seq").StartsAt(1).IncrementsBy(1);
        modelBuilder.HasSequence<int>("hold_seq").StartsAt(1).IncrementsBy(1);

        modelBuilder.Entity<ClassEntity>(entity =>
        {
            entity.ToTable("classes");

            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).HasMaxLength(64);

            entity.Property(c => c.SequenceNumber)
                .ValueGeneratedOnAdd();

            entity.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(c => c.TotalSeats)
                .IsRequired();

            entity.Property(c => c.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasMany(c => c.Holds)
                .WithOne(h => h.Class)
                .HasForeignKey(h => h.ClassId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HoldEntity>(entity =>
        {
            entity.ToTable("holds");

            entity.HasKey(h => h.Id);
            entity.Property(h => h.Id).HasMaxLength(64);

            entity.Property(h => h.SequenceNumber)
                .ValueGeneratedOnAdd();

            entity.Property(h => h.ClassId)
                .IsRequired()
                .HasMaxLength(64);

            entity.Property(h => h.StudentId)
                .IsRequired()
                .HasMaxLength(17);

            entity.Property(h => h.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(h => h.ExpiresAt)
                .IsRequired();

            entity.Property(h => h.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.Property(h => h.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasIndex(h => new { h.ClassId, h.Status, h.ExpiresAt })
                .HasDatabaseName("idx_holds_class_status_expires");

            entity.HasIndex(h => new { h.StudentId, h.ClassId })
                .HasDatabaseName("idx_holds_student_class");

            entity.HasIndex(h => h.ExpiresAt)
                .HasDatabaseName("idx_holds_expires_at");
        });
    }
}

