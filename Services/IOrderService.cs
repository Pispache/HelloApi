using MessageApi.Models.DTOs;

namespace MessageApi.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderReadDto>> GetAllOrdersAsync();
    Task<OrderReadDto?> GetOrderByIdAsync(int id);
    Task<OrderReadDto> CreateOrderAsync(OrderCreateDto orderDto);
    Task<OrderReadDto?> UpdateOrderStatusAsync(int id, string status);
    Task<bool> DeleteOrderAsync(int id);
    Task<IEnumerable<OrderReadDto>> GetOrdersByPersonIdAsync(int personId);
}
