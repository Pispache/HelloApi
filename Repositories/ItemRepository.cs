using Microsoft.EntityFrameworkCore;
using MessageApi.Data;
using MessageApi.Models;

namespace MessageApi.Repositories;

public class ItemRepository : IItemRepository
{
    private readonly AppDbContext _context;

    public ItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Item>> GetAllAsync()
    {
        return await _context.Items
            .OrderBy(i => i.Name)
            .ToListAsync();
    }

    public async Task<Item?> GetByIdAsync(int id)
    {
        return await _context.Items.FindAsync(id);
    }

    public async Task<Item> CreateAsync(Item item)
    {
        _context.Items.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<Item?> UpdateAsync(int id, Item item)
    {
        var existing = await _context.Items.FindAsync(id);
        if (existing == null) return null;

        existing.Name = item.Name;
        existing.Description = item.Description;
        existing.Price = item.Price;
        existing.Stock = item.Stock;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return false;

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Item>> GetAvailableAsync()
    {
        return await _context.Items
            .Where(i => i.Stock > 0)
            .OrderBy(i => i.Name)
            .ToListAsync();
    }
}
