using Microsoft.EntityFrameworkCore;

namespace API.Models
{
    public partial class TaskLinkDBContext : DbContext
    {
        public TaskLinkDBContext()
        {
        }

        public TaskLinkDBContext(DbContextOptions<TaskLinkDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Repeat> Repeats { get; set; } = null!;
        public virtual DbSet<Task> Tasks { get; set; } = null!;
        public virtual DbSet<TaskList> TaskLists { get; set; } = null!;
        public virtual DbSet<User> Users { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Repeat>(entity =>
            {
                entity.ToTable("Repeat");

                entity.Property(e => e.RepeatId).HasColumnName("RepeatID");

                entity.Property(e => e.RepeatName).HasMaxLength(255);

                entity.Property(e => e.Unit).HasMaxLength(255);
            });

            modelBuilder.Entity<Task>(entity =>
            {
                entity.Property(e => e.TaskId).HasColumnName("TaskID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.DueDate).HasColumnType("datetime");

                entity.Property(e => e.ListId).HasColumnName("ListID");

                entity.Property(e => e.Priority)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('Medium')");

                entity.Property(e => e.RepeatId).HasColumnName("RepeatID");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('Pending')");

                entity.Property(e => e.Title).HasMaxLength(255);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.List)
                    .WithMany(p => p.Tasks)
                    .HasForeignKey(d => d.ListId)
                    .HasConstraintName("FK__Tasks__ListID__48CFD27E");
            });

            modelBuilder.Entity<TaskList>(entity =>
            {
                entity.HasKey(e => e.ListId)
                    .HasName("PK__TaskList__E3832865E0CADB93");

                entity.Property(e => e.ListId).HasColumnName("ListID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ListName).HasMaxLength(255);

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.TaskLists)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__TaskLists__UserI__3E52440B");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username, "UQ__Users__536C85E4A82B49DD")
                    .IsUnique();

                entity.HasIndex(e => e.Email, "UQ__Users__A9D105345048066D")
                    .IsUnique();

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Email).HasMaxLength(255);

                entity.Property(e => e.Password).HasMaxLength(255);

                entity.Property(e => e.Streak).HasDefaultValueSql("((0))");

                entity.Property(e => e.CheckTime).HasDefaultValueSql("((0))");

                entity.Property(e => e.Username).HasMaxLength(255);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
