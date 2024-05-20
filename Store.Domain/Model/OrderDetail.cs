using System;
using System.Collections.Generic;

namespace Store.Model;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public int Quantity { get; set; }

    public string ProductName { get; set; } = null!;

    public string? ProductDescription { get; set; }

    public string? ProductImage { get; set; }

    public decimal PriceAtOrder { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product? Product { get; set; }
}
