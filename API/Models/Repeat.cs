using System;
using System.Collections.Generic;

namespace API.Models
{
    public partial class Repeat
    {
        public int RepeatId { get; set; }
        public string RepeatName { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int? Duration { get; set; }
    }
}
