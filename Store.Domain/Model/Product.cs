using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class Product
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public string? Description { get; set; }

    public string? Image { get; set; }

    public bool IsDeleted { get; set; }

    public decimal Price { get; set; }

    public int SubcategoryId { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();

    public virtual ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();

    public virtual Subcategory Subcategory { get; set; } = null!;

    public virtual ICollection<UserCart> UserCarts { get; set; } = new List<UserCart>();
}
