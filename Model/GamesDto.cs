using System.Text.Json.Serialization;

namespace Stridell_Origins.Model
{
    public class GamesDto
    {
        [JsonPropertyName("gameId")]
        public int GameId { get; set; }

        [JsonPropertyName("gameName")]
        public string GameName { get; set; } = string.Empty;

        [JsonPropertyName("developer")]
        public string? Developer { get; set; }

        [JsonPropertyName("publisher")]
        public string? Publisher { get; set; }

        [JsonPropertyName("genre")]
        public string? Genre { get; set; }

        [JsonPropertyName("releaseDate")]
        public DateTime? ReleaseDate { get; set; }

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("stockQuantity")]
        public int StockQuantity { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("systemRequirements")]
        public string? SystemRequirements { get; set; }

        [JsonPropertyName("rating")]
        public decimal? Rating { get; set; }

        [JsonPropertyName("language")]
        public string? Language { get; set; }

        [JsonPropertyName("imageUrl")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("isAvailable")]
        public bool IsAvailable { get; set; }
    }
}
