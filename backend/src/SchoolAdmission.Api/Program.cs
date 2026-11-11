using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Workers;

var builder = WebApplication.CreateBuilder(args);

// Read database connection string from environment variable (DATABASE_URL) or configuration
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=school_admission_db;Username=postgres;Password=postgres";

if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
    connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
}

builder.Services.AddDbContext<SchoolAdmissionDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Register Application Services
builder.Services.AddScoped<SchoolAdmission.Api.Services.IIdGenerator, SchoolAdmission.Api.Services.IdGenerator>();
builder.Services.AddScoped<SchoolAdmission.Api.Services.IClassService, SchoolAdmission.Api.Services.ClassService>();
builder.Services.AddScoped<SchoolAdmission.Api.Services.IHoldService, SchoolAdmission.Api.Services.HoldService>();

// Register Background Workers
builder.Services.AddHostedService<HoldExpirationWorker>();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-initialize database schema and sequences with retry logic for Docker
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SchoolAdmissionDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    for (int retry = 1; retry <= 5; retry++)
    {
        try
        {
            await db.Database.EnsureCreatedAsync();
            if (db.Database.IsNpgsql())
            {
                await db.Database.ExecuteSqlRawAsync("CREATE SEQUENCE IF NOT EXISTS class_seq START 1;");
                await db.Database.ExecuteSqlRawAsync("CREATE SEQUENCE IF NOT EXISTS hold_seq START 1;");
                await db.Database.ExecuteSqlRawAsync("ALTER TABLE classes ADD COLUMN IF NOT EXISTS \"HoldDurationSeconds\" integer;");
            }
            logger.LogInformation("Database schema and sequences initialized successfully.");
            break;
        }
        catch (Exception ex)
        {
            if (retry == 5)
            {
                logger.LogWarning(ex, "Could not initialize database automatically on startup. Ensure database is running.");
                break;
            }
            logger.LogWarning("Waiting for database connection... (Attempt {Retry}/5)", retry);
            await Task.Delay(2000);
        }
    }
}

// Configure the HTTP request pipeline
app.UseMiddleware<SchoolAdmission.Api.Middleware.ExceptionHandlingMiddleware>();
app.UseCors();
app.MapControllers();

app.Run();
