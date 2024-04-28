using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class Subcategory
{
    public int SubcategoryId { get; set; }

    public string SubcategoryName { get; set; } = null!;

    public int ParentCategoryId { get; set; }

    public virtual ProductCategory ParentCategory { get; set; } = null!;

    public virtual ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
