public class CreateRankingRequest
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string[] Items { get; set; }
    public bool IsPublic { get; set; } = false;

    public CreateRankingRequest()
    {
        Name = string.Empty;
        Description = string.Empty;
        Items = Array.Empty<string>();
        IsPublic = false;
    }

    public CreateRankingRequest(string name, string description, string[] items, bool isPublic = true)
    {
        Name = name;
        Description = description;
        Items = items;
        IsPublic = isPublic;
    }
}