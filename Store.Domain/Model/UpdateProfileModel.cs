using System;
using System.Collections.Generic;

namespace Store.Model;

public class UpdateProfileModel
{
	public int UserId { get; set; }
	public string UserName { get; set; }
	public string Email { get; set; }
	public string Number { get; set; }
}