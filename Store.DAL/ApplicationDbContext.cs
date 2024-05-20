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

		}
		public virtual DbSet<Model.Attribute> Attributes { get; set; }

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
			modelBuilder.Entity<Model.Attribute>(entity =>
			{
				entity.HasKey(e => e.AttributeId).HasName("PK__Attribut__C189298AD6C3A3DC");

				entity.Property(e => e.AttributeId).HasColumnName("AttributeID");
				entity.Property(e => e.AttributeName).HasMaxLength(100);
			});

			modelBuilder.Entity<Order>(entity =>
			{
				entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF1028ABD0");

				entity.Property(e => e.OrderId).HasColumnName("OrderID");
				entity.Property(e => e.DeliveryAddress).HasMaxLength(255);
				entity.Property(e => e.OrderDate).HasColumnType("datetime");
				entity.Property(e => e.Status)
					.HasMaxLength(50)
					.HasDefaultValueSql("('Заказ обрабатывается')");
				entity.Property(e => e.UserId).HasColumnName("UserID");

				entity.HasOne(d => d.User).WithMany(p => p.Orders)
					.HasForeignKey(d => d.UserId)
					.HasConstraintName("FK__Orders__UserID__5A4F643B");
			});

			modelBuilder.Entity<OrderDetail>(entity =>
			{
				entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__D3B9D30CCAA5A265");

				entity.Property(e => e.OrderDetailId).HasColumnName("OrderDetailID");
				entity.Property(e => e.OrderId).HasColumnName("OrderID");
				entity.Property(e => e.PriceAtOrder).HasColumnType("decimal(10, 2)");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.ProductName).HasMaxLength(100);

				entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
					.HasForeignKey(d => d.OrderId)
					.HasConstraintName("FK__OrderDeta__Order__5E1FF51F");

				entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails)
					.HasForeignKey(d => d.ProductId)
					.HasConstraintName("FK__OrderDeta__Produ__5F141958");
			});

			modelBuilder.Entity<Product>(entity =>
			{
				entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6ED693D31E6");

				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
				entity.Property(e => e.ProductName).HasMaxLength(100);
				entity.Property(e => e.SubcategoryId).HasColumnName("SubcategoryID");

				entity.HasOne(d => d.Subcategory).WithMany(p => p.Products)
					.HasForeignKey(d => d.SubcategoryId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__Products__Subcat__4FD1D5C8");
			});

			modelBuilder.Entity<ProductAttribute>(entity =>
			{
				entity.HasKey(e => e.ProductAttributeId).HasName("PK__ProductA__00CE67273AD3470C");

				entity.Property(e => e.ProductAttributeId).HasColumnName("ProductAttributeID");
				entity.Property(e => e.AttributeId).HasColumnName("AttributeID");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");

				entity.HasOne(d => d.Attribute).WithMany(p => p.ProductAttributes)
					.HasForeignKey(d => d.AttributeId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductAt__Attri__558AAF1E");

				entity.HasOne(d => d.Product).WithMany(p => p.ProductAttributes)
					.HasForeignKey(d => d.ProductId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductAt__Produ__54968AE5");
			});

			modelBuilder.Entity<ProductCategory>(entity =>
			{
				entity.HasKey(e => e.CategoryId).HasName("PK__ProductC__19093A2BA1608A7C");

				entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
				entity.Property(e => e.CategoryName).HasMaxLength(100);
			});

			modelBuilder.Entity<ProductReview>(entity =>
			{
				entity.HasKey(e => e.ReviewId).HasName("PK__ProductR__74BC79AE4AAE2072");

				entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.ReviewDate).HasColumnType("datetime");
				entity.Property(e => e.UserId).HasColumnName("UserID");

				entity.HasOne(d => d.Product).WithMany(p => p.ProductReviews)
					.HasForeignKey(d => d.ProductId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductRe__Produ__63D8CE75");

				entity.HasOne(d => d.User).WithMany(p => p.ProductReviews)
					.HasForeignKey(d => d.UserId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__ProductRe__UserI__64CCF2AE");
			});

			modelBuilder.Entity<Subcategory>(entity =>
			{
				entity.HasKey(e => e.SubcategoryId).HasName("PK__Subcateg__9C4E707D78CEE128");

				entity.Property(e => e.SubcategoryId).HasColumnName("SubcategoryID");
				entity.Property(e => e.ParentCategoryId).HasColumnName("ParentCategoryID");
				entity.Property(e => e.SubcategoryName).HasMaxLength(100);

				entity.HasOne(d => d.ParentCategory).WithMany(p => p.Subcategories)
					.HasForeignKey(d => d.ParentCategoryId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__Subcatego__Paren__4CF5691D");
			});

			modelBuilder.Entity<User>(entity =>
			{
				entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC1A303376");

				entity.Property(e => e.UserId).HasColumnName("UserID");
				entity.Property(e => e.Email).HasMaxLength(100);
				entity.Property(e => e.Number).HasMaxLength(256);
				entity.Property(e => e.Password).HasMaxLength(256);
				entity.Property(e => e.Role).HasMaxLength(50);
				entity.Property(e => e.Username).HasMaxLength(50);
			});

			modelBuilder.Entity<UserCart>(entity =>
			{
				entity.HasKey(e => e.CartId).HasName("PK__UserCart__51BCD797DB268F91");

				entity.ToTable("UserCart");

				entity.Property(e => e.CartId).HasColumnName("CartID");
				entity.Property(e => e.ProductId).HasColumnName("ProductID");
				entity.Property(e => e.UserId).HasColumnName("UserID");

				entity.HasOne(d => d.Product).WithMany(p => p.UserCarts)
					.HasForeignKey(d => d.ProductId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__UserCart__Produc__689D8392");

				entity.HasOne(d => d.User).WithMany(p => p.UserCarts)
					.HasForeignKey(d => d.UserId)
					.OnDelete(DeleteBehavior.ClientSetNull)
					.HasConstraintName("FK__UserCart__UserID__67A95F59");
			});

			OnModelCreatingPartial(modelBuilder);
		}

		partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
	}
}
