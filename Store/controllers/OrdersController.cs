using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.DAL;
using Store.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.IO;


namespace Store.controllers
{
	public class OrdersController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public OrdersController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<IActionResult> GetOrderDetails(int orderId)
		{
			var order = await _context.Orders
				.Include(o => o.OrderDetails)
					.ThenInclude(od => od.Product)
				.FirstOrDefaultAsync(o => o.OrderId == orderId);

			if (order == null)
			{
				return NotFound(new { Message = "Order not found" });
			}

			var orderDetails = order.OrderDetails.Select(od => new
			{
				od.Product.ProductName,
				od.Quantity,
				od.PriceAtOrder,
				TotalPrice = od.Quantity * od.PriceAtOrder
			}).ToList();

			var response = new
			{
				order.OrderId,
				order.OrderDate,
				order.Status,
				order.DeliveryAddress,
				TotalOrderPrice = orderDetails.Sum(od => od.TotalPrice),
				OrderItems = orderDetails
			};

			return Ok(response);
		}

		[HttpPost]
		public ActionResult DeleteOrder(int orderId)
		{
			var order = _context.Orders.FirstOrDefault(o => o.OrderId == orderId);
			if (order == null)
			{
				return NotFound("Order not found.");
			}

			var orderDetails = _context.OrderDetails.Where(od => od.OrderId == orderId).ToList();
			_context.OrderDetails.RemoveRange(orderDetails);

			_context.Orders.Remove(order);
			_context.SaveChanges();

			return Ok("Order deleted successfully.");
		}

		[HttpGet]
		public async Task<IEnumerable<Order>> GetAllOrders()
		{
			return await _context.Orders.ToListAsync();
		}

		[HttpPost]
		public async Task<IActionResult> UpdateOrderStatus([FromBody] OrderStatusUpdateRequest request)
		{
			if (request == null || string.IsNullOrWhiteSpace(request.Status))
			{
				return BadRequest(new { message = "Invalid request." });
			}

			var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == request.OrderId);

			if (order != null)
			{
				order.Status = request.Status;
				await _context.SaveChangesAsync();
				return Ok(new { message = "Order status updated successfully" });
			}

			return NotFound(new { message = "Order not found" });
		}
	}
}
