namespace YanbalPrestige.Api.DTOs;

public class FileUploadResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}

public class DeleteFileRequestDto
{
    public string Url { get; set; } = string.Empty;
}
