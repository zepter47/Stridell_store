using Shiny.DocumentDb;
using Stridell_Origins.Model;

namespace Stridell_Origins.Services.IndexedDb
{
    public class BrowserStoreRepository(IDocumentStore _store) : IbrowserStore
    {
        public async Task AddGamesAsync(List<GamesDto> games)
        {
            List<GamesObject> document = games.Select(game => new GamesObject
            {
                GameName = game.GameName,
                Developer = game.Developer,
                Genre = game.Genre,
                Price = game.Price,
                Rating = game.Rating,
                Description = game.Description
            }).ToList();

            await _store.BatchInsert(document);
        }

        public async Task<List<GamesObject>> GetGamesAsync()
        {
           var games = (await _store.Query<GamesObject>().ToList()).ToList();

            return games;
        }
    }
}
