using Microsoft.AspNetCore.Mvc;
using MessageApi.Models.DTOs;
using MessageApi.Services;

namespace MessageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
    {
        try
        {
            var created = await _orderService.CreateOrderAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var updated = await _orderService.UpdateOrderStatusAsync(id, status);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _orderService.DeleteOrderAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpGet("person/{personId:int}")]
    public async Task<IActionResult> GetByPersonId(int personId)
    {
        var orders = await _orderService.GetOrdersByPersonIdAsync(personId);
        return Ok(orders);
    }
}
