using Microsoft.AspNetCore.Mvc;
using MessageApi.Models;
using MessageApi.Models.DTOs;
using MessageApi.Repositories;

namespace MessageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonController : ControllerBase
{
    private readonly IPersonRepository _personRepository;

    public PersonController(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var persons = await _personRepository.GetAllAsync();
        var personDtos = persons.Select(MapToReadDto);
        return Ok(personDtos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var person = await _personRepository.GetByIdAsync(id);
        if (person == null) return NotFound();
        return Ok(MapToReadDto(person));
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        var person = await _personRepository.GetByEmailAsync(email);
        if (person == null) return NotFound();
        return Ok(MapToReadDto(person));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PersonCreateDto dto)
    {
        var person = new Person
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address
        };

        var created = await _personRepository.CreateAsync(person);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToReadDto(created));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PersonCreateDto dto)
    {
        var person = new Person
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address
        };

        var updated = await _personRepository.UpdateAsync(id, person);
        if (updated == null) return NotFound();
        return Ok(MapToReadDto(updated));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _personRepository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private static PersonReadDto MapToReadDto(Person person)
    {
        return new PersonReadDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Phone = person.Phone,
            Address = person.Address,
            CreatedAt = person.CreatedAt,
            UpdatedAt = person.UpdatedAt
        };
    }
}
