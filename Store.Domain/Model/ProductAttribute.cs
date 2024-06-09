using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class ProductAttribute
{
    public int ProductAttributeId { get; set; }

    public int ProductId { get; set; }

    public int AttributeId { get; set; }

    public string Value { get; set; } = null!;

    public bool IsDeleted { get; set; }

    public virtual Attribute Attribute { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
