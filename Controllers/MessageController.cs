using Microsoft.AspNetCore.Mvc;
using MessageApi.Models.DTOs;
using MessageApi.Services;

namespace MessageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly IMessageService _service;

    public MessageController(IMessageService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var messages = await _service.GetAllMessagesAsync();
        return Ok(messages);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var message = await _service.GetMessageByIdAsync(id);
        if (message == null) return NotFound();
        return Ok(message);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MessageCreateDto dto)
    {
        var created = await _service.CreateMessageAsync(dto.Message);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] MessageUpdateDto dto)
    {
        var updated = await _service.UpdateMessageAsync(id, dto.Message);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteMessageAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
