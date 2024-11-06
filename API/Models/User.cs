using System.Text.Json.Serialization;

namespace API.Models
{
    public partial class User
    {
        public User()
        {
            TaskLists = new HashSet<TaskList>();
        }

        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public int? CheckTime { get; set; }
        public int? Streak { get; set; }

        [JsonIgnore]
        public virtual ICollection<TaskList> TaskLists { get; set; }
    }
}
