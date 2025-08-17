using Microsoft.EntityFrameworkCore;
using MessageApi.Models;

namespace MessageApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Message> Messages => Set<Message>();
}
