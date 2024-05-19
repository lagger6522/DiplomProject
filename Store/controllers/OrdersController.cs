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
