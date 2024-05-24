using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.DAL;
using Store.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.IO;


namespace Store.controllers
{
	public class ProductsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public ProductsController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpPost]
		public async Task<IActionResult> CreateAttribute([FromBody] Model.Attribute attribute)
		{
			try
			{
				var existingAttribute = await _context.Attributes.FirstOrDefaultAsync(a => a.AttributeName == attribute.AttributeName);
				if (existingAttribute != null)
				{
					return Conflict($"Атрибут с именем '{attribute.AttributeName}' уже существует.");
				}

				_context.Attributes.Add(attribute);
				await _context.SaveChangesAsync();
				return Ok(attribute);
			}
			catch (Exception ex)
			{
				return Problem($"Ошибка при создании атрибута: {ex.Message}");
			}
		}


		[HttpGet]
		public async Task<IActionResult> GetAttributes()
		{
			try
			{
				var attributes = await _context.Attributes.ToListAsync();
				return Ok(attributes);
			}
			catch (Exception ex)
			{
				return Problem($"Ошибка при получении атрибутов: {ex.Message}");
			}
		}

		[HttpGet]
		public IActionResult GetBestSellers()
		{
			var bestSellers = _context.ProductReviews
				.Where(review => !review.IsDeleted)
				.GroupBy(review => review.ProductId)
				.Select(group => new
				{
					ProductId = group.Key,
					AverageRating = group.Average(review => review.Rating),
					TotalReviews = group.Count()
				})
				.OrderByDescending(product => product.AverageRating)
				.Take(6)
				.ToList();

			var bestSellersData = bestSellers.Select(product => new
			{
				Id = product.ProductId,
				Name = _context.Products
					.Where(p => p.ProductId == product.ProductId)
					.Select(p => p.ProductName)
					.FirstOrDefault(),
				Image = _context.Products
					.Where(p => p.ProductId == product.ProductId)
					.Select(p => p.Image)
					.FirstOrDefault(),
				Rating = product.AverageRating,
				Reviews = product.TotalReviews,
				Price = _context.Products
					.Where(p => p.ProductId == product.ProductId)
					.Select(p => p.Price)
					.FirstOrDefault(),
			}).ToList();

			return Ok(bestSellersData);
		}

		[HttpGet]
		public async Task<IEnumerable<Product>> GetProducts()
		{
			return await _context.Products.ToListAsync();
		}

		[HttpGet]
		public async Task<IActionResult> GetProductsBySubcategory(int subcategoryId)
		{
			try
			{
				var products = await _context.Products
					.Include(p => p.ProductAttributes)
					.Where(p => p.SubcategoryId == subcategoryId && !p.IsDeleted)
					.Select(p => new
					{
						p.ProductId,
						p.ProductName,
						p.Description,
						p.Price,
						AverageRating = p.ProductReviews.Any(pr => !pr.IsDeleted) ? p.ProductReviews.Where(pr => !pr.IsDeleted).Average(pr => pr.Rating) : 0,
						ReviewCount = p.ProductReviews.Count(pr => !pr.IsDeleted),
						p.ProductAttributes,
						p.Image
					})
					.ToListAsync();

				return Ok(products);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Error getting products by subcategory: {ex.Message}" });
			}
		}


		[HttpGet]
		public IActionResult GetAttributesForSubcategory(int subcategoryId)
		{
			try
			{
				var attributes = _context.ProductAttributes
					.Include(pa => pa.Attribute)
					.Where(pa => pa.Product.SubcategoryId == subcategoryId)
					.Select(pa => pa.Attribute)
					.Distinct()
					.ToList();

				var attributeModels = attributes.Select(attribute => new
				{
					attributeId = attribute.AttributeId,
					attributeName = attribute.AttributeName,
					values = _context.ProductAttributes
						.Where(pa => pa.AttributeId == attribute.AttributeId && pa.Product.SubcategoryId == subcategoryId)
						.Select(pa => pa.Value)
						.Distinct()
						.ToList()
				}).ToList();

				return Ok(attributeModels);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Произошла ошибка: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> CreateProduct(
	[FromForm] string productName, [FromForm] string description, [FromForm] decimal price, [FromForm] int subcategoryId, [FromForm] IFormFile? image, [FromForm] Dictionary<int, string> attributes)
		{
			try
			{
				Product product = new Product
				{
					ProductName = productName,
					Description = description,
					Price = price,
					SubcategoryId = subcategoryId,
					Image = $"/images/{image?.FileName}"
				};

				if (image != null)
				{
					using (Stream fileStream = new FileStream("ClientApp/public" + product.Image, FileMode.Create))
					{
						await image.CopyToAsync(fileStream);
					}
				}

				_context.Products.Add(product);
				await _context.SaveChangesAsync();

				foreach (var attribute in attributes)
				{
					if (!string.IsNullOrEmpty(attribute.Value))
					{
						var productAttribute = new ProductAttribute
						{
							ProductId = product.ProductId,
							AttributeId = attribute.Key,
							Value = attribute.Value
						};
						_context.ProductAttributes.Add(productAttribute);
					}
				}

				await _context.SaveChangesAsync();

				return Ok(new { message = "Товар успешно создан." });
			}
			catch (Exception ex)
			{
				return Problem($"Ошибка при создании товара: {ex.Message}");
			}
		}




		[HttpGet]
		public async Task<IActionResult> GetProductDetails(int productId)
		{
			try
			{
				var product = await _context.Products
					.Where(p => p.ProductId == productId)
					.Select(p => new
					{
						p.ProductId,
						p.ProductName,
						p.Description,
						p.Price,
						AverageRating = p.ProductReviews.Where(pr => !pr.IsDeleted).Average(pr => (double?)pr.Rating) ?? 0,
						ReviewCount = p.ProductReviews.Count(pr => !pr.IsDeleted),
						p.Image,
						Attributes = p.ProductAttributes.Select(pa => new
						{
							pa.AttributeId,
							pa.Attribute.AttributeName,
							pa.Value
						}).ToList()
					})
					.FirstOrDefaultAsync();

				if (product == null)
				{
					return NotFound(new { message = "Product not found." });
				}

				return Ok(product);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Error getting product details: {ex.Message}" });
			}
		}


		[HttpPost]
		public async Task<IActionResult> HideProduct(int productId)
		{
			var product = await _context.Products.FindAsync(productId);

			if (product == null)
			{
				return NotFound(new { Message = "Product not found" });
			}

			product.IsDeleted = true;
			_context.Products.Update(product);
			await _context.SaveChangesAsync();

			return Ok(new { Message = "Product hidden successfully" });
		}


		[HttpPut]
		public async Task<IActionResult> EditProduct(
	int productId,
	[FromForm] string productName,
	[FromForm] string description,
	[FromForm] decimal price,
	[FromForm] IFormFile? image,
	[FromForm] Dictionary<int, string> attributes)
		{
			try
			{
				if (productId == 0 || string.IsNullOrEmpty(productName) || string.IsNullOrEmpty(description))
				{
					return BadRequest(new { message = "Invalid input parameters." });
				}

				var product = await _context.Products
					.Include(p => p.ProductAttributes)
					.FirstOrDefaultAsync(p => p.ProductId == productId);

				if (product == null)
				{
					return NotFound(new { message = "Товар не найден." });
				}

				product.ProductName = productName;
				product.Description = description;
				product.Price = price;

				if (image != null)
				{
					product.Image = $"/images/{image.FileName}";
					using (Stream fileStream = new FileStream("ClientApp/public" + product.Image, FileMode.Create))
					{
						await image.CopyToAsync(fileStream);
					}
				}

				var existingAttributes = product.ProductAttributes.ToDictionary(pa => pa.AttributeId);
				foreach (var attribute in attributes)
				{
					if (existingAttributes.ContainsKey(attribute.Key))
					{
						existingAttributes[attribute.Key].Value = attribute.Value;
					}
					else
					{
						var newAttribute = new ProductAttribute
						{
							ProductId = product.ProductId,
							AttributeId = attribute.Key,
							Value = attribute.Value
						};
						_context.ProductAttributes.Add(newAttribute);
					}
				}

				await _context.SaveChangesAsync();

				return Ok(new { message = "Товар успешно обновлен." });
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error: {ex.Message}");
				return StatusCode(500, new { message = $"Ошибка при обновлении товара: {ex.Message}" });
			}
		}

	}
}
