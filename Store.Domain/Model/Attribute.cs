using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class Attribute
{
    public int AttributeId { get; set; }

    public string AttributeName { get; set; } = null!;

    public bool IsDeleted { get; set; }

    public virtual ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();
}
