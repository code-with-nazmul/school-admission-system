using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;

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

// Configure the HTTP request pipeline
app.UseMiddleware<SchoolAdmission.Api.Middleware.ExceptionHandlingMiddleware>();
app.UseCors();
app.MapControllers();

app.Run();
