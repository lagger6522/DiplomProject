using System;
using System.Collections.Generic;

namespace Store.Model;

public class ChangePasswordModel
{
	public int UserID { get; set; }
	public string OldPassword { get; set; }
	public string NewPassword { get; set; }
}