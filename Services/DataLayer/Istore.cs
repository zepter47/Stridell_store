using Stridell_Origins.Model;

namespace Stridell_Origins.Services.DataLayer
{
    public interface Istore
    {
        Task<List<GamesDto>> GetGamesAsync();

        Task<List<GamesDto>> SearchGamesAsync(string searchTerm);
    }
}
