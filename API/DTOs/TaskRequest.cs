namespace API.DTOs
{
    public class TaskRequest
    {
        public int ListId { get; set; }
        public string Title { get; set; } = null!;
        public string? Note { get; set; }
        public DateTime DueDate { get; set; }
        public int? RepeatId { get; set; }
        public string? Priority { get; set; }
        public string? Status { get; set; }
    }
}
