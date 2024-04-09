using System;
using System.Collections.Generic;

namespace Store.Model;

public class OrderFormModel
{
	public string Email { get; set; }
	public string PhoneNumber { get; set; }
	public string City { get; set; }
	public string Street { get; set; }
	public string House { get; set; }
	public string Entrance { get; set; }
	public string Apartment { get; set; }
	public bool IsPrivateHouse { get; set; }
	public string PaymentMethod { get; set; }
}

