namespace backend.Auth;

public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public byte[] SigningKey { get; set; } = Array.Empty<byte>();

    public TimeSpan AccessTokenLifetime { get; set; } = TimeSpan.FromHours(1);
}
