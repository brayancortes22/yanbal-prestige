namespace YanbalPrestige.Api.Services.Interfaces;

public interface IMediaStorageService
{
    Task<(string url, string fileName, long size)> SaveFileAsync(IFormFile file, string subFolder);
    bool DeleteFile(string relativeOrAbsoluteUrl);
}
