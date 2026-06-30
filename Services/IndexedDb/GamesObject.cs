using System.Text.Json.Serialization;

namespace Stridell_Origins.Services.IndexedDb
{
    public class GamesObject
    {
        public int Id { get; set; }

        public string GameName { get; set; } = string.Empty;

        public string? Developer { get; set; }

        public string? Publisher { get; set; }

        public string? Genre { get; set; }

        public DateTime? ReleaseDate { get; set; }

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public string? Description { get; set; }

        public string? SystemRequirements { get; set; }

        public decimal? Rating { get; set; }

        public string? Language { get; set; }

        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool IsAvailable { get; set; }

    }
}
