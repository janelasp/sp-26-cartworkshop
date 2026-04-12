using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class AppUser
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Role { get; set; } = "User";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
