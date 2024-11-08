using System.Text.Json.Serialization;

namespace API.Models
{
    public partial class Task
    {
        public int TaskId { get; set; }
        public int ListId { get; set; }
        public string Title { get; set; } = null!;
        public string? Note { get; set; }
        public DateTime DueDate { get; set; }
        public int? RepeatId { get; set; }
        public string? Priority { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        [JsonIgnore]
        public virtual TaskList? List { get; set; } = null!;
        [JsonIgnore]
        public virtual Repeat Repeat { get; set; } = null!;
    }
}
