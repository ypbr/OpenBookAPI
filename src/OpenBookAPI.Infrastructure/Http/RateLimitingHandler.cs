using System.Threading.RateLimiting;

namespace OpenBookAPI.Infrastructure.Http;

/// <summary>
/// HTTP message handler that implements rate limiting to comply with OpenLibrary API limits.
/// OpenLibrary limits: API = 180 requests/minute (3 req/sec), with burst allowance.
/// </summary>
public class RateLimitingHandler : DelegatingHandler
{
    private readonly RateLimiter _rateLimiter;

    public RateLimitingHandler() : base()
    {
        // OpenLibrary API limit: 180 requests/minute = 3 requests/second
        // Using token bucket with burst capability for better UX
        _rateLimiter = new TokenBucketRateLimiter(new TokenBucketRateLimiterOptions
        {
            TokenLimit = 5,                              // Burst capacity
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 100,                            // Max queued requests
            ReplenishmentPeriod = TimeSpan.FromSeconds(1),
            TokensPerPeriod = 3,                         // 3 tokens per second = 180/min
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
            // If rate limit is exceeded and queue is full, return 429
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
