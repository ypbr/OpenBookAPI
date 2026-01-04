using OpenBookAPI.Api.Extensions;
using OpenBookAPI.Api.Middleware;
using OpenBookAPI.Application.Extensions;
using OpenBookAPI.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register Application & Infrastructure services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Configure HSTS options for production
builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(365);
});

// Configure Kestrel to hide server header
builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Security headers should be added early in the pipeline
app.UseSecurityHeaders();

app.UseExceptionHandling();

// HSTS should be used in production (enforces HTTPS)
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
else
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// API Client validation - ensures only registered mobile apps can access
app.UseApiClientValidation();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
