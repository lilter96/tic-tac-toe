using Microsoft.EntityFrameworkCore;
using tic_tac_toe;

namespace EFDataApp.Models
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Game> Games { get; set; }
        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            //Database.EnsureDeleted();
            Database.EnsureCreated();   
        }
    }
}