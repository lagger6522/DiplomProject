using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.DAL;
using Store.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.IO;


namespace Store.controllers
{
	public class SubcategoriesController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public SubcategoriesController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<IEnumerable<Subcategory>> GetVisibleSubcategories()
		{
			return await _context.Subcategories
				.Where(subcategory => subcategory.Products.Any(product => !product.IsDeleted))
				.ToListAsync();
		}

		[HttpGet]
		public async Task<IEnumerable<Subcategory>> GetSubcategories()
		{
			return await _context.Subcategories
				.Where(subcategory => !subcategory.IsDeleted)
				.ToListAsync();
		}


		[HttpPost]
		public async Task<IActionResult> CreateSubcategory([FromBody] Subcategory subcategory)
		{
			try
			{
				var existingSubcategory = await _context.Subcategories
					.FirstOrDefaultAsync(s => s.SubcategoryName == subcategory.SubcategoryName && !s.IsDeleted);

				if (existingSubcategory != null)
				{
					return BadRequest(new { message = "Подкатегория с таким названием уже существует." });
				}

				_context.Subcategories.Add(subcategory);
				await _context.SaveChangesAsync();

				return Ok(new { message = "Подкатегория успешно создана." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Внутренняя ошибка сервера." });
			}
		}



		[HttpPut]
		public IActionResult RemoveSubcategory(int subcategoryId)
		{
			try
			{
				var subcategory = _context.Subcategories.Include(s => s.Products)
									 .FirstOrDefault(s => s.SubcategoryId == subcategoryId);

				if (subcategory == null)
				{
					return NotFound(new { message = "Подкатегория не найдена." });
				}

				foreach (var product in subcategory.Products)
				{
					product.IsDeleted = true;
				}

				subcategory.IsDeleted = true;
				_context.SaveChanges();

				return Ok(new { message = "Подкатегория успешно удалена. Товары скрыты." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при удалении подкатегории: {ex.Message}" });
			}
		}


		[HttpPut]
		public async Task<IActionResult> EditSubcategory(int subcategoryId, [FromBody] Subcategory subcategory)
		{
			try
			{
				var existingSubcategory = await _context.Subcategories
					.FirstOrDefaultAsync(c => c.SubcategoryId == subcategoryId);

				if (existingSubcategory == null)
				{
					return NotFound(new { message = "Подкатегория не найдена." });
				}

				var duplicateSubcategory = await _context.Subcategories
					.FirstOrDefaultAsync(c => c.SubcategoryName == subcategory.SubcategoryName &&
											  c.ParentCategoryId == existingSubcategory.ParentCategoryId &&
											  c.SubcategoryId != subcategoryId && !c.IsDeleted);

				if (duplicateSubcategory != null)
				{
					return BadRequest(new { message = "Подкатегория с таким названием уже существует для данной категории." });
				}

				existingSubcategory.SubcategoryName = subcategory.SubcategoryName;

				await _context.SaveChangesAsync();

				return Ok(new { message = "Подкатегория успешно обновлена." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при обновлении подкатегории: {ex.Message}" });
			}
		}
	}
}
