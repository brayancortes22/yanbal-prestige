using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Services.Interfaces;

public interface ICrmService
{
    Task<List<ConsultantClient>> GetClientsByConsultantAsync(string consultantId);
    Task<ConsultantClient> SaveClientAsync(ConsultantClient client);
    Task<bool> DeleteClientAsync(string id, string consultantId);
}
