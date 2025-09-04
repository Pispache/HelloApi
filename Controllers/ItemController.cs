using Microsoft.AspNetCore.Mvc;
using MessageApi.Models;
using MessageApi.Models.DTOs;
using MessageApi.Repositories;

namespace MessageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly IItemRepository _itemRepository;

    public ItemController(IItemRepository itemRepository)
    {
        _itemRepository = itemRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _itemRepository.GetAllAsync();
        var itemDtos = items.Select(MapToReadDto);
        return Ok(itemDtos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _itemRepository.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(MapToReadDto(item));
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable()
    {
        var items = await _itemRepository.GetAvailableAsync();
        var itemDtos = items.Select(MapToReadDto);
        return Ok(itemDtos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ItemCreateDto dto)
    {
        var item = new Item
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock
        };

        var created = await _itemRepository.CreateAsync(item);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToReadDto(created));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ItemCreateDto dto)
    {
        var item = new Item
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock
        };

        var updated = await _itemRepository.UpdateAsync(id, item);
        if (updated == null) return NotFound();
        return Ok(MapToReadDto(updated));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _itemRepository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private static ItemReadDto MapToReadDto(Item item)
    {
        return new ItemReadDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            Price = item.Price,
            Stock = item.Stock,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }
}
