using System.ComponentModel.DataAnnotations;

namespace MessageApi.Models;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    public int PersonId { get; set; }
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0")]
    public decimal TotalAmount { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Processing, Completed, Cancelled
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual Person Person { get; set; } = null!;
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
