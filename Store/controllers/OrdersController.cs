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
		public IActionResult UpdateOrderStatus([FromBody] OrderStatusUpdateRequest request)
		{
			if (request == null || string.IsNullOrWhiteSpace(request.Status))
			{
				return BadRequest("Invalid request.");
			}

			var order = _context.Orders.FirstOrDefault(o => o.OrderId == request.OrderId);

			if (order != null)
			{
				order.Status = request.Status;
				_context.SaveChanges();
				return Ok();
			}

			return NotFound("Order not found");
		}
	}
}
