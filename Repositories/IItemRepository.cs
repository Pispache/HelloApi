using MessageApi.Models;

namespace MessageApi.Repositories;

public interface IItemRepository
{
    Task<IEnumerable<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(int id);
    Task<Item> CreateAsync(Item item);
    Task<Item?> UpdateAsync(int id, Item item);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Item>> GetAvailableAsync();
}
