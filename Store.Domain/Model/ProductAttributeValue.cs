using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class ProductAttributeValue
{
    public int ProductAttributeValueId { get; set; }

    public int ProductId { get; set; }

    public int AttributeId { get; set; }

    public string? Value { get; set; }

    public virtual ProductAttribute Attribute { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
