namespace simple_rank_backend.DTOs;

public class SetMetadataDTO
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}

public class ResponseBase
{
    public string Message { get; set; } = string.Empty;
}
