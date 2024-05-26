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

		[HttpGet]
		public async Task<IEnumerable<ProductCategory>> GetVisibleCategories()
		{
			return await _context.ProductCategories
				.Where(category => category.Subcategories.Any(subcategory => subcategory.Products.Any(product => !product.IsDeleted)))
				.ToListAsync();
		}


		[HttpPut]
		public IActionResult RemoveCategory(int categoryId)
		{
			try
			{
				var category = _context.ProductCategories.Include(c => c.Subcategories).ThenInclude(s => s.Products)
									 .FirstOrDefault(c => c.CategoryId == categoryId);

				if (category == null)
				{
					return NotFound(new { message = "Категория не найдена." });
				}

				foreach (var subcategory in category.Subcategories)
				{
					foreach (var product in subcategory.Products)
					{
						product.IsDeleted = true;
					}

					subcategory.IsDeleted = true;

				}
				category.IsDeleted = true;
				_context.SaveChanges();

				return Ok(new { message = "Категория и подкатегории успешно удалены. Товары скрыты." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при удалении категории: {ex.Message}" });
			}
		}


		[HttpPut]
		public async Task<IActionResult> EditCategory(int categoryId, [FromBody] ProductCategory updatedCategory)
		{
			try
			{
				var existingCategory = await _context.ProductCategories.FirstOrDefaultAsync(c => c.CategoryId == categoryId);

				if (existingCategory == null)
				{
					return NotFound(new { message = "Категория не найдена." });
				}

				var visibleCategory = await _context.ProductCategories.FirstOrDefaultAsync(c => c.CategoryName == updatedCategory.CategoryName && !c.IsDeleted && c.CategoryId != categoryId);

				if (visibleCategory != null)
				{
					return BadRequest(new { message = "Категория с таким названием уже существует." });
				}

				existingCategory.CategoryName = updatedCategory.CategoryName;

				await _context.SaveChangesAsync();

				return Ok(new { message = "Категория успешно обновлена." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при обновлении категории: {ex.Message}" });
			}
		}


		[HttpPost]
		public async Task<IActionResult> CreateCategory([FromBody] ProductCategory category)
		{
			try
			{
				var hiddenCategory = await _context.ProductCategories
					.FirstOrDefaultAsync(c => c.CategoryName == category.CategoryName && c.IsDeleted);

				var visibleCategory = await _context.ProductCategories
					.FirstOrDefaultAsync(c => c.CategoryName == category.CategoryName && !c.IsDeleted);

				if (visibleCategory != null)
				{
					return BadRequest(new { message = "Категория с таким названием уже существует." });
				}

				if (hiddenCategory != null && visibleCategory == null)
				{
					_context.ProductCategories.Add(category);
					await _context.SaveChangesAsync();
					return Ok(new { message = "Категория успешно создана." });
				}

				if (hiddenCategory == null && visibleCategory == null)
				{
					_context.ProductCategories.Add(category);
					await _context.SaveChangesAsync();
					return Ok(new { message = "Категория успешно создана." });
				}

				return BadRequest(new { message = "Категория с таким названием уже существует." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Внутренняя ошибка сервера." });
			}
		}

		[HttpGet]
		public async Task<IEnumerable<ProductCategory>> GetCategories()
		{
			return await _context.ProductCategories
				.Where(category => !category.IsDeleted)
				.ToListAsync();
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
