using backend.Auth;
using backend.Data;
using backend.Middleware;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration.Json;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>(optional: true);
}

var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "BuckeyeMarketplace";
var jwtAudience = builder.Configuration["JWT_AUDIENCE"] ?? "buckeye-marketplace-frontend";
var jwtSigningKeyRaw = RequireJwtSigningKeyFromEnvironmentOrUserSecrets(builder.Configuration, builder.Environment);
var jwtSigningKeyBytes = Encoding.UTF8.GetBytes(jwtSigningKeyRaw);

if (jwtSigningKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "JWT_SIGNING_KEY is too short. Provide at least 32 bytes (256 bits) of key material." +
        " (Tip: use a long random string; do not store this in appsettings.)");
}

var jwtSettings = new JwtSettings
{
    Issuer = jwtIssuer,
    Audience = jwtAudience,
    SigningKey = jwtSigningKeyBytes,
    AccessTokenLifetime = TimeSpan.FromHours(1)
};

// --- Services ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddDbContext<MarketplaceContext>(options =>
    options.UseSqlite("Data Source=MarketplaceDb.dev.db"));

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddScoped<IPasswordHasher<backend.Models.AppUser>, PasswordHasher<backend.Models.AppUser>>();

builder.Services.AddSingleton(jwtSettings);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtSettings.SigningKey),

            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),

            ValidAlgorithms = [SecurityAlgorithms.HmacSha256]
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

static string RequireJwtSigningKeyFromEnvironmentOrUserSecrets(IConfiguration configuration, IHostEnvironment environment)
{
    const string key = "JWT_SIGNING_KEY";

    var envValue = Environment.GetEnvironmentVariable(key);
    if (!string.IsNullOrWhiteSpace(envValue))
    {
        return envValue;
    }

    if (configuration is IConfigurationRoot root)
    {
        foreach (var provider in root.Providers)
        {
            if (provider is JsonConfigurationProvider jsonProvider)
            {
                var path = jsonProvider.Source.Path ?? string.Empty;
                var isAppSettings = path.StartsWith("appsettings", StringComparison.OrdinalIgnoreCase);

                if (isAppSettings && jsonProvider.TryGet(key, out var appsettingsValue) && !string.IsNullOrWhiteSpace(appsettingsValue))
                {
                    throw new InvalidOperationException(
                        "JWT_SIGNING_KEY must not be configured in appsettings*.json. " +
                        "Use an environment variable or .NET User Secrets instead.");
                }
            }
        }

        if (environment.IsDevelopment())
        {
            foreach (var provider in root.Providers)
            {
                if (provider is JsonConfigurationProvider jsonProvider)
                {
                    var path = jsonProvider.Source.Path ?? string.Empty;
                    var isUserSecrets = path.EndsWith("secrets.json", StringComparison.OrdinalIgnoreCase);

                    if (isUserSecrets && jsonProvider.TryGet(key, out var secretsValue) && !string.IsNullOrWhiteSpace(secretsValue))
                    {
                        return secretsValue;
                    }
                }
            }
        }
    }

    if (environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "JWT_SIGNING_KEY is required. Set it via environment variable or .NET User Secrets. " +
            "Example: cd backend && dotnet user-secrets init && dotnet user-secrets set JWT_SIGNING_KEY \"<32+ char secret>\".");
    }

    throw new InvalidOperationException(
        "JWT_SIGNING_KEY must be set as an environment variable in non-Development environments.");
}

// --- Middleware Pipeline ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// --- Seed Data ---

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MarketplaceContext>();
    context.Database.Migrate();

    if (app.Environment.IsDevelopment())
    {
        var seedUsername = app.Configuration["DEV_SEED_USERNAME"] ?? "demo";
        var seedPassword = app.Configuration["DEV_SEED_PASSWORD"];
        var seedRole = app.Configuration["DEV_SEED_ROLE"] ?? "User";

        if (string.IsNullOrWhiteSpace(seedPassword))
        {
            app.Logger.LogInformation(
                "DEV_SEED_PASSWORD is not set; skipping dev user seed. Set DEV_SEED_PASSWORD (and optionally DEV_SEED_USERNAME) to enable.");
        }
        else
        {
            var existingUser = context.Users.FirstOrDefault(u => u.Username == seedUsername);

            if (existingUser is null)
            {
                var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<backend.Models.AppUser>>();
                var newUser = new backend.Models.AppUser
                {
                    Username = seedUsername,
                    Role = seedRole,
                    CreatedAt = DateTime.UtcNow
                };

                newUser.PasswordHash = passwordHasher.HashPassword(newUser, seedPassword);
                context.Users.Add(newUser);
                context.SaveChanges();

                app.Logger.LogInformation("Seeded dev user {Username} with role {Role}.", seedUsername, seedRole);
            }
        }
    }
}

app.Run();

public partial class Program;
