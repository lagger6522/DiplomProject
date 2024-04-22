using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Store.DAL;
using Store.Domain.Model;
using Store.Model;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;


namespace Store.controllers
{
	public class UserController : Controller
	{

		private readonly ApplicationDbContext _context;

		public UserController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpPost]
		public IActionResult MakeManager(int userId)
		{
			try
			{
				var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
				if (user != null)
				{
					user.Role = "Manager";
					_context.SaveChanges();
					return Ok(new { message = $"Пользователь с ID {userId} назначен менеджером." });
				}
				else
				{
					return NotFound(new { message = $"Пользователь с ID {userId} не найден." });
				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при назначении пользователя менеджером: {ex.Message}" });
			}
		}

		[HttpPost]
		public IActionResult RemoveManager(int userId)
		{
			try
			{
				var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
				if (user != null)
				{
					user.Role = "User";
					_context.SaveChanges();
					return Ok(new { message = $"Пользователь с ID {userId} больше не является менеджером." });
				}
				else
				{
					return NotFound(new { message = $"Пользователь с ID {userId} не найден." });
				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при снятии пользователя с роли менеджера: {ex.Message}" });
			}
		}


		[HttpPost]
		public IActionResult UnbanUser(int userId)
		{
			try
			{
				var user = _context.Users.FirstOrDefault(u => u.UserId == userId);

				if (user == null)
				{
					return NotFound(new { message = "Пользователь не найден." });
				}

				user.IsBanned = false;

				_context.SaveChanges();

				return Ok(new { message = $"Пользователь {user.Username} успешно разблокирован." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при разблокировке пользователя: {ex.Message}" });
			}
		}


		[HttpPost]
		public IActionResult BanUser(int userId)
		{
			try
			{
				var user = _context.Users.FirstOrDefault(u => u.UserId == userId);

				if (user == null)
				{
					return NotFound(new { message = "Пользователь не найден." });
				}

				user.IsBanned = true;

				_context.SaveChanges();

				return Ok(new { message = $"Пользователь {user.Username} успешно заблокирован." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при блокировке пользователя: {ex.Message}" });
			}
		}

		[HttpGet]
		public IActionResult GetOrdersByUserId(int userId)
		{
			try
			{
				var orders = _context.Orders
					.Where(o => o.UserId == userId)
					.ToList();

				return Ok(orders);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message });
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetUserName(int userId)
		{
			try
			{
				var user = await _context.Users
					.FirstOrDefaultAsync(u => u.UserId == userId);

				if (user == null)
				{
					return NotFound(new { message = "Пользователь не найден." });
				}

				return Ok(new { userName = user.Username });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = $"Ошибка при получении имени пользователя: {ex.Message}" });
			}
		}

		[Authorize]
		[HttpGet]
		public IActionResult Check()
		{
			if (User.Identity == null || !User.Identity.IsAuthenticated) return Problem("Пользователь не авторизован.");
			var claim = User.Claims.FirstOrDefault(n => n.Type == "ClaimTypes.UserId");
			if (claim == null) 
				return Problem("Пользователь не авторизован.");
			int UserId = -1;
			if (int.TryParse(claim.Value, out UserId))
			{
				var user = _context.Users.FirstOrDefault(u => u.UserId == UserId);
				if (user == null) 
					return Problem("Пользователя не существует");
				return Ok(new { role = user.Role, number = user.Number, email = user.Email, userName = user.Username, userId = user.UserId });
			}
			return Problem("Пользователь не авторизован.");

		}

		[Authorize]
		[HttpPost]
		public async Task<IActionResult> singOut()
		{
			await HttpContext.SignOutAsync();
			
			return Ok();
		}

		private bool VerifyPassword(string enteredPassword, string hashedPassword)
		{
			string enteredPasswordHash = HashPassword(enteredPassword);

			return hashedPassword.Equals(enteredPasswordHash);
		}

		[HttpPost]
		public async Task<IActionResult> LoginAsync([FromBody] LoginModel model)
		{
			var user = _context.Users.FirstOrDefault(u => u.Email == model.Email);

			if (user == null)
			{
				return Unauthorized(new { message = "Данный E-main не зарегистрирован." });
			}

			if (user.IsBanned)
			{
				return Unauthorized(new { message = "Ваш аккаунт заблокирован." });
			}

			if (!VerifyPassword(model.Password, user.Password))
			{
				return Unauthorized(new { message = "Неправильный пароль." });
			}

			var token = GenerateToken(user);

			ClaimsIdentity identity = new ClaimsIdentity(new Claim[]
			{
				new Claim("ClaimTypes.UserId", user.UserId.ToString()),
				new Claim(ClaimTypes.Role, user.Role),
			},
			CookieAuthenticationDefaults.AuthenticationScheme);
			ClaimsPrincipal principal = new ClaimsPrincipal(identity);
			await HttpContext.SignInAsync(
			  CookieAuthenticationDefaults.AuthenticationScheme, principal);
			return Ok(new { token, role = user.Role, number = user.Number, email = user.Email, userName = user.Username, userId = user.UserId });
		}


		private string GenerateToken(User user)
		{
			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.ASCII.GetBytes("SecretKey-%#93506930222F#R%");
			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(new Claim[]
				{
				new Claim("ClaimTypes.UserId", user.UserId.ToString()),
					new Claim(ClaimTypes.Role, user.Role),
				}),
				Expires = DateTime.UtcNow.AddDays(1),
				SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
			};
			var token = tokenHandler.CreateToken(tokenDescriptor);
			return tokenHandler.WriteToken(token);
		}

		[HttpPost]
		public async Task<IActionResult> Register([FromBody] RegisterModel model)
		{
			if (_context.Users.Any(u => u.Email == model.Email))
			{
				Console.WriteLine($"Пользователь с email '{model.Email}' уже существует.");

				ModelState.AddModelError("Email", "Пользователь с таким email уже существует.");
				return Problem("Пользователь с таким email уже существует.");
			}

			var user = new User
			{
				Username = model.Name,
				Email = model.Email,
				Number = model.Phone,
				Password = HashPassword(model.Password),
				Role = "User",
				IsBanned = false
			};


			_context.Users.Add(user);
			await _context.SaveChangesAsync();

			return Json(new { message = "Регистрация успешна." });
		}

		public string HashPassword(string password)
		{
			using (SHA256 sha256Hash = SHA256.Create())
			{
				byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

				StringBuilder builder = new StringBuilder();
				for (int i = 0; i < bytes.Length; i++)
				{
					builder.Append(bytes[i].ToString("x2"));
				}
				return builder.ToString();
			}
		}

		public async Task<IEnumerable<User>> GetUsersAsync()
		{
			return await _context.Users.ToListAsync();
		}
	}
}	
