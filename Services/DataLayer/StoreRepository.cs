using Stridell_Origins.Model;
using Stridell_Origins.Services.SupabaseModels;

namespace Stridell_Origins.Services.DataLayer
{
    public class StoreRepository(Supabase.Client _supabase) : Istore
    {
        public async Task<List<GamesDto>> GetGamesAsync()
        {
            var response = await _supabase.From<SupaGames>()
                    .Select(x => new object[] { x.GameId,x.GameName, x.Developer, x.Genre, x.Price, x.Rating, x.Description  })
                    .Get();

            var gamesList = response.Models;

            List<GamesDto> gamesDtos = gamesList.Select(game => new GamesDto
            {
                GameId = game.GameId,
                GameName = game.GameName,
                Developer = game.Developer,
                Genre = game.Genre,
                Price = game.Price,
                Rating = game.Rating,
                Description = game.Description,
            }).ToList();

            return gamesDtos;
        }
    }
}
