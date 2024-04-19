using System.ComponentModel.DataAnnotations;

namespace Store.Domain.Model
{
	public class RegisterModel
	{
		[Required(ErrorMessage = "Имя пользователя обязательно.")]
		public string Name { get; set; }

		[Required(ErrorMessage = "Email обязателен.")]
		[EmailAddress(ErrorMessage = "Некорректный формат email.")]
		public string Email { get; set; }

		[Required(ErrorMessage = "Телефон обязателен.")]
		public string Phone { get; set; }

		[Required(ErrorMessage = "Пароль обязателен.")]
		[MinLength(8, ErrorMessage = "Пароль должен содержать минимум 6 символов.")]
		public string Password { get; set; }

		[Required(ErrorMessage = "Роль пользователя обязательна.")]
		public string Role { get; set; }

		[Required(ErrorMessage = "Статус бана обязателен.")]
		public bool IsBanned { get; set; }
	}
}
