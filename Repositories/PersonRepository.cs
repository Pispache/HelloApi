using Microsoft.EntityFrameworkCore;
using MessageApi.Data;
using MessageApi.Models;

namespace MessageApi.Repositories;

public class PersonRepository : IPersonRepository
{
    private readonly AppDbContext _context;

    public PersonRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Person>> GetAllAsync()
    {
        return await _context.Persons
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .ToListAsync();
    }

    public async Task<Person?> GetByIdAsync(int id)
    {
        return await _context.Persons.FindAsync(id);
    }

    public async Task<Person> CreateAsync(Person person)
    {
        _context.Persons.Add(person);
        await _context.SaveChangesAsync();
        return person;
    }

    public async Task<Person?> UpdateAsync(int id, Person person)
    {
        var existing = await _context.Persons.FindAsync(id);
        if (existing == null) return null;

        existing.FirstName = person.FirstName;
        existing.LastName = person.LastName;
        existing.Email = person.Email;
        existing.Phone = person.Phone;
        existing.Address = person.Address;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var person = await _context.Persons.FindAsync(id);
        if (person == null) return false;

        _context.Persons.Remove(person);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Person?> GetByEmailAsync(string email)
    {
        return await _context.Persons
            .FirstOrDefaultAsync(p => p.Email == email);
    }
}
