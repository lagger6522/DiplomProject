using System.ComponentModel.DataAnnotations;

namespace Store.Domain.Model
{
	public class LoginModel
	{

		[Required(ErrorMessage = "Email обязателен.")]
		public string Email { get; set; }


		[Required(ErrorMessage = "Пароль обязателен.")]
		public string Password { get; set; }
	}
}
