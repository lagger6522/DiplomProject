using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.DAL;
using Store.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.IO;


namespace Store.controllers
{
	public class CartController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public CartController(ApplicationDbContext context)
		{
			_context = context;
		}


		[HttpPost]
		public async Task<IActionResult> AddToCart([FromBody] UserCart cartItem)
		{
			try
			{
				// Проверяем, существует ли уже запись в корзине для данного товара и пользователя
				var existingCartItem = await _context.UserCarts
					.Where(ci => ci.ProductId == cartItem.ProductId && ci.UserId == cartItem.UserId)
					.FirstOrDefaultAsync();

				if (existingCartItem != null)
				{
					// Если запись уже существует, обновляем количество
					existingCartItem.Quantity += cartItem.Quantity;
				}
				else
				{
					// Если записи нет, добавляем новую запись в корзину
					_context.UserCarts.Add(cartItem);
				}

				// Сохраняем изменения в базе данных
				await _context.SaveChangesAsync();

				return Ok("Товар успешно добавлен в корзину.");
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Произошла ошибка: {ex.Message}");
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetCartItems(int userId)
		{
			try
			{
				// Получаем товары в корзине для указанного пользователя
				var cartItems = await _context.UserCarts
					.Where(ci => ci.UserId == userId)
					.Include(ci => ci.Product)
					.Select(ci => new
					{
						ci.CartId,
						ci.UserId,
						ci.ProductId,
						ci.Quantity,
						Product = new
						{
							ci.Product.ProductId,
							ci.Product.ProductName,
							ci.Product.Description,
							ci.Product.Image,
							ci.Product.Price,
						}
					})
					.ToListAsync();

				return Ok(cartItems);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Произошла ошибка: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> UpdateCartItemQuantity([FromBody] UpdateCartItemQuantityRequest request)
		{
			try
			{
				// Проверяем, что запрос содержит все необходимые данные
				if (request == null || request.UserId <= 0 || request.ProductId <= 0 || request.Quantity < 0)
				{
					return BadRequest("Некорректный запрос");
				}

				// Находим товар в корзине для указанного пользователя
				var cartItem = await _context.UserCarts
					.FirstOrDefaultAsync(ci => ci.UserId == request.UserId && ci.ProductId == request.ProductId);

				if (cartItem == null)
				{
					return NotFound("Товар не найден в корзине");
				}

				// Обновляем количество товара
				cartItem.Quantity = request.Quantity;
				await _context.SaveChangesAsync();

				return Ok("Количество товара в корзине успешно обновлено");
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Произошла ошибка: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> RemoveCartItem([FromBody] RemoveCartItemRequest request)
		{
			try
			{
				// Проверяем, что запрос содержит все необходимые данные
				if (request == null || request.UserId <= 0 || request.ProductId <= 0)
				{
					return BadRequest("Некорректный запрос");
				}

				// Находим товар в корзине для указанного пользователя
				var cartItem = await _context.UserCarts
					.FirstOrDefaultAsync(ci => ci.UserId == request.UserId && ci.ProductId == request.ProductId);

				if (cartItem == null)
				{
					return NotFound("Товар не найден в корзине");
				}

				// Удаляем товар из корзины
				_context.UserCarts.Remove(cartItem);
				await _context.SaveChangesAsync();

				return Ok("Товар успешно удален из корзины");
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Произошла ошибка: {ex.Message}");
			}
		}

		private string BuildDeliveryAddress(OrderFormModel orderForm)
		{
			return $"{orderForm.City}, {orderForm.Street}, {orderForm.House}, {orderForm.Entrance}, {orderForm.Apartment}";
		}

		[HttpPost]
		public async Task<IActionResult> CreateOrder([FromBody] OrderFormModel orderForm, int userId)
		{
			try
			{
				// Преобразуйте данные из orderForm в модель заказа
				var order = new Order
				{
					UserId = userId,
					OrderDate = DateTime.Now,
					Status = "Заказ обрабатывается",
					DeliveryAddress = BuildDeliveryAddress(orderForm),
				};

				// Сохраните заказ в базе данных
				_context.Orders.Add(order);
				await _context.SaveChangesAsync();

				// Получите OrderID после сохранения заказа
				var orderId = order.OrderId;

				// Проход по товарам в корзине и добавление их в OrderDetails
				foreach (var cartItem in _context.UserCarts.Where(c => c.UserId == order.UserId))
				{
					var orderDetail = new OrderDetail
					{
						OrderId = order.OrderId,
						ProductId = cartItem.ProductId,
						Quantity = cartItem.Quantity,
					};

					Console.WriteLine($"Creating OrderDetail: OrderId = {orderDetail.OrderId}, ProductId = {orderDetail.ProductId}, Quantity = {orderDetail.Quantity}");

					_context.OrderDetails.Add(orderDetail);
				}

				_context.UserCarts.RemoveRange(_context.UserCarts.Where(c => c.UserId == order.UserId));

				await _context.SaveChangesAsync();

				return Ok(new { message = "Заказ успешно создан" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message });
			}
		}

		[HttpPost]
		public async Task<IActionResult> ClearCart([FromBody] ClearCartModel clearCartModel, int userId)
		{
			try
			{
				_context.UserCarts.RemoveRange(_context.UserCarts.Where(c => c.UserId == userId));
				await _context.SaveChangesAsync();

				return Ok(new { message = "Корзина успешно очищена" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message });
			}
		}
	}
}
