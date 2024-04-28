using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class ProductAttribute
{
    public int AttributeId { get; set; }

    public string AttributeName { get; set; } = null!;

    public int SubcategoryId { get; set; }

    public virtual ICollection<ProductAttributeValue> ProductAttributeValues { get; set; } = new List<ProductAttributeValue>();

    public virtual Subcategory Subcategory { get; set; } = null!;
}
