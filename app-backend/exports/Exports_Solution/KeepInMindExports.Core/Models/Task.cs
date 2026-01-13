namespace KeepInMindExports.Core.Models
{
    public class Task
    {
        private int _id;
        private string? _title;
        private string? _description;
        private string? _category;
        private string? _created;
        private string? _expiration;
        private string? _notes;
        private bool _completed;
        private string? _completedAt;
        private string? _userId;

        public int Id { get => _id; set => _id = value; }
        public string? Title { get => _title; set => _title = value; }
        public string? Description { get => _description; set => _description = value; }
        public string? Category { get => _category; set => _category = value; }
        public string? Created { get => _created; set => _created = value; }
        public string? Expiration { get => _expiration; set => _expiration = value; }
        public string? Notes { get => _notes; set => _notes = value; }
        public bool Completed { get => _completed; set => _completed = value; }
        public string? CompletedAt { get => _completedAt; set => _completedAt = value; }
        public string? UserId { get => _userId; set => _userId = value; }

        public override string ToString()
        {
            return $"{_id} - {_title} - {_description} - {_userId}";
        }
    }
}
