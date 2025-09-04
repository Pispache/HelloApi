using System.ComponentModel.DataAnnotations;

namespace MessageApi.Models.DTOs;

public class OrderCreateDto
{
    [Required]
    public int PersonId { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    [Required]
    public List<OrderDetailCreateDto> OrderDetails { get; set; } = new List<OrderDetailCreateDto>();
}

public class OrderDetailCreateDto
{
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }
}
