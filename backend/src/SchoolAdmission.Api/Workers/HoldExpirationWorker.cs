using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Data.Entities;

namespace SchoolAdmission.Api.Workers;

public class HoldExpirationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HoldExpirationWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(10);

    public HoldExpirationWorker(
        IServiceProvider serviceProvider,
        ILogger<HoldExpirationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HoldExpirationWorker started. Check interval: {Interval}s", _checkInterval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SweepExpiredHoldsAsync(stoppingToken);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error occurred during expired holds sweep.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task SweepExpiredHoldsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<SchoolAdmissionDbContext>();
        var now = DateTime.UtcNow;

        var expiredCount = await context.Holds
            .Where(h => h.Status == HoldStatus.Held && h.ExpiresAt <= now)
            .ExecuteUpdateAsync(setter => setter
                .SetProperty(h => h.Status, HoldStatus.Expired)
                .SetProperty(h => h.UpdatedAt, now),
                cancellationToken);

        if (expiredCount > 0)
        {
            _logger.LogInformation("Swept and expired {Count} hold(s) at {Timestamp}", expiredCount, now);
        }
    }
}

