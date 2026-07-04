using Stridell_Origins.Model;

namespace Stridell_Origins.Services.IndexedDb
{
    public interface IbrowserStore
    {
        Task AddGamesAsync(List<GamesDto> games);

        Task<List<GamesDto>> GetGamesAsync();

    }
}
