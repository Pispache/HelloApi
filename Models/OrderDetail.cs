using System.ComponentModel.DataAnnotations;

namespace MessageApi.Models;

public class OrderDetail
{
    public int Id { get; set; }
    
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0")]
    public decimal UnitPrice { get; set; }
    
    public decimal TotalPrice => Quantity * UnitPrice;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Order Order { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
}
