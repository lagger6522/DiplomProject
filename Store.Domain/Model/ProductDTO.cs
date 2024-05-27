using System;
using System.Collections.Generic;

namespace Store.Model;

public class ProductDTO
{
	public int ProductId { get; set; }
	public string ProductName { get; set; }
	public string Description { get; set; }
	public string Image { get; set; }
	public decimal Price { get; set; }
	public int SubcategoryId { get; set; }
	public double AverageRating { get; set; }
	public int ReviewCount { get; set; }
}
