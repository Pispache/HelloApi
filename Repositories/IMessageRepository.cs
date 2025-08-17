using MessageApi.Models;

namespace MessageApi.Repositories;

public interface IMessageRepository
{
    Task<Message> AddMessageAsync(string message);
    Task<IEnumerable<Message>> GetAllMessagesAsync();
    Task<Message?> GetMessageByIdAsync(int id);
    Task<Message?> UpdateMessageAsync(Message message);
    Task<bool> DeleteMessageAsync(int id);
}
