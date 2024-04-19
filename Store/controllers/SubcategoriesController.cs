﻿using Microsoft.AspNetCore.Authorization;
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
		public async Task<IEnumerable<Subcategory>> GetSubcategories()
		{
			return await _context.Subcategories.ToListAsync();
		}

		[HttpPost]
		public async Task<IActionResult> CreateSubcategory([FromBody] Subcategory subcategory)
		{
			try
			{
				// Проверка наличия подкатегории с таким же названием в базе данных
				var existingSubcategory = await _context.Subcategories
					.FirstOrDefaultAsync(s => s.SubcategoryName == subcategory.SubcategoryName && s.ParentCategoryId == subcategory.ParentCategoryId);

				if (existingSubcategory != null)
				{
					// Подкатегория с таким названием уже существует для данной категории
					return BadRequest(new { message = "Подкатегория с таким названием уже существует для данной категории." });
				}

				// Добавление новой подкатегории
				_context.Subcategories.Add(subcategory);
				await _context.SaveChangesAsync();

				return Ok(new { message = "Подкатегория успешно создана." });
			}
			catch (Exception ex)
			{
				// Обработка ошибок
				return StatusCode(500, new { message = "Внутренняя ошибка сервера." });
			}
		}

		[HttpDelete]
		public IActionResult RemoveSubcategory(int subcategoryId)
		{
			try
			{
				// Находим подкатегорию по ID
				var subcategory = _context.Subcategories.Include(s => s.Products)
									 .FirstOrDefault(s => s.SubcategoryId == subcategoryId);

				if (subcategory == null)
				{
					return NotFound(new { message = "Подкатегория не найдена." });
				}

				// Удаление всех товаров, связанных с подкатегорией
				_context.Products.RemoveRange(subcategory.Products);

				// Удаление подкатегории
				_context.Subcategories.Remove(subcategory);

				_context.SaveChanges();

				return Ok(new { message = "Подкатегория и товары успешно удалены." });
			}
			catch (Exception ex)
			{
				// Обработка ошибок
				return StatusCode(500, new { message = $"Ошибка при удалении подкатегории: {ex.Message}" });
			}
		}

		[HttpPut]
		public async Task<IActionResult> EditSubcategory(int subcategoryId, [FromBody] Subcategory SubcategoryName)
		{
			try
			{
				var existingSubcategory = await _context.Subcategories
					.FirstOrDefaultAsync(c => c.SubcategoryId == subcategoryId);

				if (existingSubcategory == null)
				{
					return NotFound(new { message = "Подкатегория не найдена." });
				}

				// Обновляем данные категории
				existingSubcategory.SubcategoryName = SubcategoryName.SubcategoryName;

				// Сохраняем изменения
				await _context.SaveChangesAsync();

				return Ok(new { message = "Подкатегория успешно обновлена." });
			}
			catch (Exception ex)
			{
				// Обработка ошибок
				return StatusCode(500, new { message = $"Ошибка при обновлении подкатегории: {ex.Message}" });
			}
		}
	}
}