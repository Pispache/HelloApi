using MessageApi.Data;
using MessageApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MessageApi.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly AppDbContext _context;

    public MessageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Message> AddMessageAsync(string message)
    {
        var entity = new Message
        {
            MessageText = message,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        _context.Messages.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<IEnumerable<Message>> GetAllMessagesAsync()
    {
        return await _context.Messages.OrderBy(m => m.Id).ToListAsync();
    }

    public async Task<Message?> GetMessageByIdAsync(int id)
    {
        return await _context.Messages.FindAsync(id);
    }

    public async Task<Message?> UpdateMessageAsync(Message message)
    {
        var existing = await _context.Messages.FindAsync(message.Id);
        if (existing == null) return null;

        existing.MessageText = message.MessageText;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteMessageAsync(int id)
    {
        var entity = await _context.Messages.FindAsync(id);
        if (entity == null) return false;

        _context.Messages.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
