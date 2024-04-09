using System;
using System.Collections.Generic;

namespace Store.Model;

public class OrderStatusUpdateRequest
{
	public int OrderId { get; set; }
	public string Status { get; set; }
}


