using System.Text.Json.Serialization;

namespace API.Models
{
    public partial class TaskList
    {
        public TaskList()
        {
            Tasks = new HashSet<Task>();
        }

        public int ListId { get; set; }
        public int UserId { get; set; }
        public string ListName { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }

        [JsonIgnore]
        public virtual User User { get; set; } = null!;
        [JsonIgnore]
        public virtual ICollection<Task> Tasks { get; set; }
    }
}
