using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;
using OpenBookAPI.Infrastructure.Configuration;

namespace OpenBookAPI.Infrastructure.Http;

/// <summary>
/// HTTP message handler that implements rate limiting to comply with OpenLibrary API limits.
/// Configuration is loaded from appsettings.json OpenLibrary:RateLimit section.
/// </summary>
public class RateLimitingHandler : DelegatingHandler
{
    private readonly RateLimiter _rateLimiter;

    public RateLimitingHandler(IOptions<OpenLibraryOptions> options) : base()
    {
        var rateLimitOptions = options.Value.RateLimit;

        _rateLimiter = new TokenBucketRateLimiter(new TokenBucketRateLimiterOptions
        {
            TokenLimit = rateLimitOptions.TokenLimit,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = rateLimitOptions.QueueLimit,
            ReplenishmentPeriod = TimeSpan.FromSeconds(rateLimitOptions.ReplenishmentPeriodSeconds),
            TokensPerPeriod = rateLimitOptions.TokensPerPeriod,
            AutoReplenishment = true
        });
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        using var lease = await _rateLimiter.AcquireAsync(1, cancellationToken);

        if (!lease.IsAcquired)
        {
            return new HttpResponseMessage(System.Net.HttpStatusCode.TooManyRequests)
            {
                Content = new StringContent("Rate limit exceeded. Please try again later."),
                ReasonPhrase = "Rate limit exceeded"
            };
        }

        return await base.SendAsync(request, cancellationToken);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _rateLimiter.Dispose();
        }
        base.Dispose(disposing);
    }
}
