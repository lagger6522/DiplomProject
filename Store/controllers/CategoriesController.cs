using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.DAL;
using Store.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.IO;


namespace Store.controllers
{
	public class CategoriesController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public CategoriesController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpDelete]
		public IActionResult RemoveCategory(int categoryId)
		{
			try
			{
				// Находите категорию по ID
				var category = _context.ProductCategories.Include(c => c.Subcategories).ThenInclude(s => s.Products)
									 .FirstOrDefault(c => c.CategoryId == categoryId);

				if (category == null)
				{
					return NotFound(new { message = "Категория не найдена." });
				}

				// Удаление всех товаров, связанных с подкатегориями
				foreach (var subcategory in category.Subcategories)
				{
					_context.Products.RemoveRange(subcategory.Products);
				}

				// Удаление подкатегорий
				_context.Subcategories.RemoveRange(category.Subcategories);

				// Удаление категории
				_context.ProductCategories.Remove(category);

				_context.SaveChanges();

				return Ok(new { message = "Категория, подкатегории и товары успешно удалены." });
			}
			catch (Exception ex)
			{
				// Обработка ошибок
				return StatusCode(500, new { message = $"Ошибка при удалении категории: {ex.Message}" });
			}
		}

		[HttpPut]
		public async Task<IActionResult> EditCategory(int categoryId, [FromBody] ProductCategory CategoryName)
		{
			try
			{
				// Находим категорию по ID
				var existingCategory = await _context.ProductCategories
					.FirstOrDefaultAsync(c => c.CategoryId == categoryId);

				if (existingCategory == null)
				{
					return NotFound(new { message = "Категория не найдена." });
				}

				// Обновляем данные категории
				existingCategory.CategoryName = CategoryName.CategoryName;

				// Сохраняем изменения
				await _context.SaveChangesAsync();

				return Ok(new { message = "Категория успешно обновлена." });
			}
			catch (Exception ex)
			{
				// Обработка ошибок
				return StatusCode(500, new { message = $"Ошибка при обновлении категории: {ex.Message}" });
			}
		}

		[HttpPost]
		public async Task<IActionResult> CreateCategory([FromBody] ProductCategory category)
		{
			try
			{
				// Проверка наличия категории с таким же названием в базе данных
				var existingCategory = await _context.ProductCategories
					.FirstOrDefaultAsync(c => c.CategoryName == category.CategoryName);

				if (existingCategory != null)
				{
					// Категория с таким названием уже существует
					return BadRequest(new { message = "Категория с таким названием уже существует." });
				}

				// Добавление новой категории
				_context.ProductCategories.Add(category);
				await _context.SaveChangesAsync();

				return Ok(new { message = "Категория успешно создана." });
			}
			catch (Exception ex)
			{
				// Обработка ошибок
				return StatusCode(500, new { message = "Внутренняя ошибка сервера." });
			}
		}

		[HttpGet]
		public async Task<IEnumerable<ProductCategory>> GetCategories()
		{
			return await _context.ProductCategories.ToListAsync();
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
