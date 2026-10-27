using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Services.Interfaces;

public interface ITipService
{
    Task<List<Tip>> GetActiveTipsAsync();
    Task<List<Tip>> GetAllTipsAsync();
    Task<Tip?> GetTipByIdAsync(string id);
    Task<Tip> SaveTipAsync(Tip tip);
    Task<bool> DeleteTipAsync(string id);
}
