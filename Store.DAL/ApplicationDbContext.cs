using Microsoft.EntityFrameworkCore;
using Store.Model;

namespace Store.DAL
{
	public partial class ApplicationDbContext : DbContext
	{
		public ApplicationDbContext()
		{
		}

		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
		{

			// создается бд если не была создана
			//DataBase.EnsureCreated();
		}
		public virtual DbSet<Order> Orders { get; set; }

		public virtual DbSet<OrderDetail> OrderDetails { get; set; }

		public virtual DbSet<Product> Products { get; set; }

		public virtual DbSet<ProductAttribute> ProductAttributes { get; set; }

		public virtual DbSet<ProductCategory> ProductCategories { get; set; }

		public virtual DbSet<ProductReview> ProductReviews { get; set; }

		public virtual DbSet<Subcategory> Subcategories { get; set; }

		public virtual DbSet<User> Users { get; set; }

		public virtual DbSet<UserCart> UserCarts { get; set; }

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
			=> optionsBuilder.UseSqlServer("Server=192.168.100.166,1433;Database=STOREDB;User ID=sa;Password=123;TrustServerCertificate=True;");

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Order>(entity =>
			{
				entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF3055FAAC");

				entity.Property(e => e.OrderId).HasColumnName("OrderID");
				entity.Property(e => e.DeliveryAddress).HasMaxLength(255);
				entity.Property(e => e.OrderDate).HasColumnType("datetime");
				entity.Property(e => e.Status)
					.HasMaxLength(50)
					.HasDefaultValueSql("('Заказ обрабатывается')");
				entity.Property(e => e.UserId).HasColumnName("UserID");

				entity.HasOne(d => d.User).WithMany(p => p.Orders)
					.HasForeignKey(d => d.UserId)
					.HasConstraintName("FK__Orders__UserID__5F7E2DAC");
			});

			modelBuilder.Entity<OrderDetail>(entity =>
			{
				entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__D3B9D30C1242A3B1");

				entity.Property(e => e.OrderDetailId).HasColumnName("OrderDetailID");
				entity.Property(e => e.OrderId).HasColumnName("OrderID");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");

				entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
					.HasForeignKey(d => d.OrderId)
					.HasConstraintName("FK__OrderDeta__Order__625A9A57");

				entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails)
					.HasForeignKey(d => d.ProductId)
					.HasConstraintName("FK__OrderDeta__Produ__634EBE90");
			});

			modelBuilder.Entity<Product>(entity =>
			{
				entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6EDA585EC80");

				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
				entity.Property(e => e.ProductName).HasMaxLength(100);
				entity.Property(e => e.SubcategoryId).HasColumnName("SubcategoryID");

				entity.HasOne(d => d.Subcategory).WithMany(p => p.Products)
					.HasForeignKey(d => d.SubcategoryId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__Products__Subcat__57DD0BE4");
			});

			modelBuilder.Entity<ProductAttribute>(entity =>
			{
				entity.HasKey(e => e.AttributeId).HasName("PK__ProductA__C189298A61106B1C");

				entity.Property(e => e.AttributeId).HasColumnName("AttributeID");
				entity.Property(e => e.AttributeName).HasMaxLength(100);
				entity.Property(e => e.ProductId).HasColumnName("ProductID");

				entity.HasOne(d => d.Product).WithMany(p => p.ProductAttributes)
					.HasForeignKey(d => d.ProductId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductAt__Produ__5AB9788F");
			});

			modelBuilder.Entity<ProductCategory>(entity =>
			{
				entity.HasKey(e => e.CategoryId).HasName("PK__ProductC__19093A2B5FF5A86C");

				entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
				entity.Property(e => e.CategoryName).HasMaxLength(100);
			});

			modelBuilder.Entity<ProductReview>(entity =>
			{
				entity.HasKey(e => e.ReviewId).HasName("PK__ProductR__74BC79AE5C3F2E03");

				entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.ReviewDate).HasColumnType("datetime");
				entity.Property(e => e.UserId).HasColumnName("UserID");

				entity.HasOne(d => d.Product).WithMany(p => p.ProductReviews)
					.HasForeignKey(d => d.ProductId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductRe__Produ__681373AD");

				entity.HasOne(d => d.User).WithMany(p => p.ProductReviews)
					.HasForeignKey(d => d.UserId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductRe__UserI__690797E6");
			});

			modelBuilder.Entity<Subcategory>(entity =>
			{
				entity.HasKey(e => e.SubcategoryId).HasName("PK__Subcateg__9C4E707D0A8D7139");

				entity.Property(e => e.SubcategoryId).HasColumnName("SubcategoryID");
				entity.Property(e => e.ParentCategoryId).HasColumnName("ParentCategoryID");
				entity.Property(e => e.SubcategoryName).HasMaxLength(100);

				entity.HasOne(d => d.ParentCategory).WithMany(p => p.Subcategories)
					.HasForeignKey(d => d.ParentCategoryId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__Subcatego__Paren__55009F39");
			});

			modelBuilder.Entity<User>(entity =>
			{
				entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC5AB673BB");

				entity.Property(e => e.UserId).HasColumnName("UserID");
				entity.Property(e => e.Email).HasMaxLength(100);
				entity.Property(e => e.Number).HasMaxLength(256);
				entity.Property(e => e.Password).HasMaxLength(256);
				entity.Property(e => e.Role).HasMaxLength(50);
				entity.Property(e => e.Username).HasMaxLength(50);
			});

			modelBuilder.Entity<UserCart>(entity =>
			{
				entity.HasKey(e => e.CartId).HasName("PK__UserCart__51BCD7971AC9764C");

				entity.ToTable("UserCart");

				entity.Property(e => e.CartId).HasColumnName("CartID");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.UserId).HasColumnName("UserID");

				entity.HasOne(d => d.Product).WithMany(p => p.UserCarts)
					.HasForeignKey(d => d.ProductId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__UserCart__Produc__6CD828CA");

				entity.HasOne(d => d.User).WithMany(p => p.UserCarts)
					.HasForeignKey(d => d.UserId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__UserCart__UserID__6BE40491");
			});

			OnModelCreatingPartial(modelBuilder);
		}

		partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
	}
}
