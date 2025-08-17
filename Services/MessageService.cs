using MessageApi.Models;
using MessageApi.Models.DTOs;
using MessageApi.Repositories;

namespace MessageApi.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _repository;

    public MessageService(IMessageRepository repository)
    {
        _repository = repository;
    }

    public async Task<MessageReadDto> CreateMessageAsync(string message)
    {
        var entity = await _repository.AddMessageAsync(message);
        return MapToReadDto(entity);
    }

    public async Task<IEnumerable<MessageReadDto>> GetAllMessagesAsync()
    {
        var entities = await _repository.GetAllMessagesAsync();
        return entities.Select(MapToReadDto);
    }

    public async Task<MessageReadDto?> GetMessageByIdAsync(int id)
    {
        var entity = await _repository.GetMessageByIdAsync(id);
        return entity == null ? null : MapToReadDto(entity);
    }

    public async Task<MessageReadDto?> UpdateMessageAsync(int id, string message)
    {
        var entity = new Message
        {
            Id = id,
            MessageText = message
        };

        var updated = await _repository.UpdateMessageAsync(entity);
        return updated == null ? null : MapToReadDto(updated);
    }

    public async Task<bool> DeleteMessageAsync(int id)
    {
        return await _repository.DeleteMessageAsync(id);
    }

    private static MessageReadDto MapToReadDto(Message message) => new()
    {
        Id = message.Id,
        Message = message.MessageText,
        CreatedAt = message.CreatedAt,
        UpdatedAt = message.UpdatedAt
    };
}
