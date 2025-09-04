using Microsoft.EntityFrameworkCore;
using MessageApi.Data;
using MessageApi.Models;

namespace MessageApi.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        return await _context.Orders
            .Include(o => o.Person)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Item)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        return await _context.Orders
            .Include(o => o.Person)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Item)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order> CreateAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(order.Id) ?? order;
    }

    public async Task<Order?> UpdateAsync(int id, Order order)
    {
        var existing = await _context.Orders.FindAsync(id);
        if (existing == null) return null;

        existing.Status = order.Status;
        existing.Notes = order.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Order>> GetByPersonIdAsync(int personId)
    {
        return await _context.Orders
            .Include(o => o.Person)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Item)
            .Where(o => o.PersonId == personId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }
}
