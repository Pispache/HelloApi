using MessageApi.Models;
using MessageApi.Models.DTOs;
using MessageApi.Repositories;

namespace MessageApi.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IItemRepository _itemRepository;
    private readonly IPersonRepository _personRepository;

    public OrderService(IOrderRepository orderRepository, IItemRepository itemRepository, IPersonRepository personRepository)
    {
        _orderRepository = orderRepository;
        _itemRepository = itemRepository;
        _personRepository = personRepository;
    }

    public async Task<IEnumerable<OrderReadDto>> GetAllOrdersAsync()
    {
        var orders = await _orderRepository.GetAllAsync();
        return orders.Select(MapToReadDto);
    }

    public async Task<OrderReadDto?> GetOrderByIdAsync(int id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        return order == null ? null : MapToReadDto(order);
    }

    public async Task<OrderReadDto> CreateOrderAsync(OrderCreateDto orderDto)
    {
        // Validate person exists
        var person = await _personRepository.GetByIdAsync(orderDto.PersonId);
        if (person == null)
            throw new ArgumentException("Person not found");

        // Calculate total and validate items
        decimal totalAmount = 0;
        var orderDetails = new List<OrderDetail>();

        foreach (var detailDto in orderDto.OrderDetails)
        {
            var item = await _itemRepository.GetByIdAsync(detailDto.ItemId);
            if (item == null)
                throw new ArgumentException($"Item with ID {detailDto.ItemId} not found");

            if (item.Stock < detailDto.Quantity)
                throw new ArgumentException($"Insufficient stock for item {item.Name}. Available: {item.Stock}, Requested: {detailDto.Quantity}");

            var orderDetail = new OrderDetail
            {
                ItemId = detailDto.ItemId,
                Quantity = detailDto.Quantity,
                UnitPrice = item.Price
            };

            orderDetails.Add(orderDetail);
            totalAmount += orderDetail.TotalPrice;

            // Update stock
            item.Stock -= detailDto.Quantity;
            await _itemRepository.UpdateAsync(item.Id, item);
        }

        var order = new Order
        {
            PersonId = orderDto.PersonId,
            TotalAmount = totalAmount,
            Notes = orderDto.Notes,
            OrderDetails = orderDetails
        };

        var createdOrder = await _orderRepository.CreateAsync(order);
        return MapToReadDto(createdOrder);
    }

    public async Task<OrderReadDto?> UpdateOrderStatusAsync(int id, string status)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null) return null;

        order.Status = status;
        var updatedOrder = await _orderRepository.UpdateAsync(id, order);
        return updatedOrder == null ? null : MapToReadDto(updatedOrder);
    }

    public async Task<bool> DeleteOrderAsync(int id)
    {
        return await _orderRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<OrderReadDto>> GetOrdersByPersonIdAsync(int personId)
    {
        var orders = await _orderRepository.GetByPersonIdAsync(personId);
        return orders.Select(MapToReadDto);
    }

    private static OrderReadDto MapToReadDto(Order order)
    {
        return new OrderReadDto
        {
            Id = order.Id,
            PersonId = order.PersonId,
            Person = new PersonReadDto
            {
                Id = order.Person.Id,
                FirstName = order.Person.FirstName,
                LastName = order.Person.LastName,
                Email = order.Person.Email,
                Phone = order.Person.Phone,
                Address = order.Person.Address,
                CreatedAt = order.Person.CreatedAt,
                UpdatedAt = order.Person.UpdatedAt
            },
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            OrderDetails = order.OrderDetails.Select(od => new OrderDetailReadDto
            {
                Id = od.Id,
                OrderId = od.OrderId,
                ItemId = od.ItemId,
                Item = new ItemReadDto
                {
                    Id = od.Item.Id,
                    Name = od.Item.Name,
                    Description = od.Item.Description,
                    Price = od.Item.Price,
                    Stock = od.Item.Stock,
                    CreatedAt = od.Item.CreatedAt,
                    UpdatedAt = od.Item.UpdatedAt
                },
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                TotalPrice = od.TotalPrice,
                CreatedAt = od.CreatedAt
            }).ToList()
        };
    }
}
