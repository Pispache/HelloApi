using MessageApi.Models;

namespace MessageApi.Repositories;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetAllAsync();
    Task<Order?> GetByIdAsync(int id);
    Task<Order> CreateAsync(Order order);
    Task<Order?> UpdateAsync(int id, Order order);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Order>> GetByPersonIdAsync(int personId);
}
