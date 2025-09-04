namespace MessageApi.Models.DTOs;

public class OrderReadDto
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public PersonReadDto Person { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<OrderDetailReadDto> OrderDetails { get; set; } = new List<OrderDetailReadDto>();
}

public class OrderDetailReadDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ItemId { get; set; }
    public ItemReadDto Item { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}
