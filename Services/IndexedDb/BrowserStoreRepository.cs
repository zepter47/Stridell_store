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

        public async Task<List<GamesDto>> GetGamesAsync()
        {
           var games = (await _store.Query<GamesObject>().Select(x => 
           new GamesDto
           {
               GameId = x.Id, GameName = x.GameName, Developer = x.Developer,
               Genre = x.Genre, Price = x.Price, Rating = x.Rating,
               Description = x.Description
           }).ToList()).ToList();

            return games;
        }

        public async Task<List<GamesDto>> SearchGamesAsync(string SearchText)
        {
            var gamer = (await _store.Query<GamesObject>().Where(game => game.GameName.Contains(SearchText, StringComparison.OrdinalIgnoreCase))
            .Select(x =>
           new GamesDto
           {
               GameId = x.Id,
               GameName = x.GameName,
               Developer = x.Developer,
               Genre = x.Genre,
               Price = x.Price,
               Rating = x.Rating,
               Description = x.Description
           }).ToList()).ToList();

            //var results = await _store.FullTextSearch<GamesObject>(SearchText, maxResults: 50);

            //var gamer = (results
            //    .Select(result => result.Document)
            //    .Select(game => new GamesDto
            //    {
            //        GameId = game.Id,
            //        GameName = game.GameName,
            //        Developer = game.Developer,
            //        Genre = game.Genre,
            //        Price = game.Price,
            //        Rating = game.Rating,
            //        Description = game.Description,
            //    })
            //    .ToList()).ToList();

            return gamer;
        }
    }
}
