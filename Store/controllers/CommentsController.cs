using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.DAL;
using Store.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.IO;


namespace Store.controllers
{
	public class CommentsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public CommentsController(ApplicationDbContext context)
		{
			_context = context;
		}


		[HttpPost]
		public async Task<IActionResult> AddReview(ProductReview review)
		{
			try
			{
				// Задаем дату отзыва
				review.ReviewDate = DateTime.Now;

				// Добавляем отзыв в базу данных
				_context.ProductReviews.Add(review);
				await _context.SaveChangesAsync();

				return Ok("Отзыв успешно добавлен.");
			}
			catch (Exception ex)
			{
				// Обработка ошибок, если необходимо
				return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetProductReviews(int productId)
		{
			try
			{
				var reviews = await _context.ProductReviews
					.Where(pr => pr.ProductId == productId && !pr.IsDeleted)
					.Include(pr => pr.User)
					.Select(pr => new
					{
						pr.ReviewId,
						pr.UserId,
						UserName = pr.User.Username,
						pr.Rating,
						pr.Comment,
						pr.ReviewDate,
						pr.IsDeleted
					})
					.ToListAsync();

				return Ok(new
				{
					Reviews = reviews
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Error getting product reviews: {ex.Message}" });
			}
		}

		[HttpGet]
		public IActionResult GetAllComments()
		{
			try
			{				
				var comments = _context.ProductReviews
					.Include(pr => pr.User) 
					.Select(pr => new
					{
						pr.ReviewId,
						pr.ProductId,
						pr.UserId,
						pr.Rating,
						pr.Comment,
						pr.ReviewDate,
						pr.IsDeleted,
						UserName = pr.User.Username,
						UserEmail = pr.User.Email
					})
					.ToList();

				return Ok(comments);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при получении комментариев: {ex.Message}" });
			}
		}


		[HttpPost]
		public IActionResult ToggleCommentVisibility(int reviewId, bool isVisible)
		{
			try
			{
				var comment = _context.ProductReviews.FirstOrDefault(pr => pr.ReviewId == reviewId);

				if (comment == null)
				{
					return NotFound(new { message = "Комментарий не найден." });
				}

				comment.IsDeleted = isVisible;
				_context.SaveChanges();

				return Ok(new { message = isVisible ? "Комментарий успешно скрыт." : "Комментарий сделан видимым." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при изменении видимости комментария: {ex.Message}" });
			}
		}
	}
}
