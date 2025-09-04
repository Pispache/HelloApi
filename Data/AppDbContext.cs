using Microsoft.EntityFrameworkCore;
using MessageApi.Models;

namespace MessageApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Person> Persons => Set<Person>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Person)
            .WithMany(p => p.Orders)
            .HasForeignKey(o => o.PersonId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderDetail>()
            .HasOne(od => od.Order)
            .WithMany(o => o.OrderDetails)
            .HasForeignKey(od => od.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderDetail>()
            .HasOne(od => od.Item)
            .WithMany(i => i.OrderDetails)
            .HasForeignKey(od => od.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure decimal precision
        modelBuilder.Entity<Item>()
            .Property(i => i.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderDetail>()
            .Property(od => od.UnitPrice)
            .HasPrecision(18, 2);
    }
}
