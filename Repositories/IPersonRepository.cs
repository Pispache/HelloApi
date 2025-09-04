using MessageApi.Models;

namespace MessageApi.Repositories;

public interface IPersonRepository
{
    Task<IEnumerable<Person>> GetAllAsync();
    Task<Person?> GetByIdAsync(int id);
    Task<Person> CreateAsync(Person person);
    Task<Person?> UpdateAsync(int id, Person person);
    Task<bool> DeleteAsync(int id);
    Task<Person?> GetByEmailAsync(string email);
}
