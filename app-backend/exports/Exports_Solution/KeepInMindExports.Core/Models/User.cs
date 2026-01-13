namespace KeepInMindExports.Core.Models
{
    public class User
    {
        private int _id;
        private string? _name;
        private string? _surname;
        private string? _email;

        public int Id { get => _id; set => _id = value; }
        public string? Name { get => _name; set => _name = value; }
        public string? Surname { get => _surname; set => _surname = value; }
        public string? Email { get => _email; set => _email = value; }

        public override string ToString()
        {
            return $"{_name} - {_surname} - {_email}";
        }
    }
}
