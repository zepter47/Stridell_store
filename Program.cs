using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Shiny.DocumentDb;
using Shiny.DocumentDb.IndexedDb;
using Stridell_Origins;
using Stridell_Origins.Services.Auth;
using Stridell_Origins.Services.DataLayer;
using Stridell_Origins.Services.IndexedDb;
using Supabase;
using DaffittTech.NetworkStatus;
using Stridell_Origins.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

// 1. Load Supabase configuration
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:AnonKey"];

// IndexedDB-backed document store - browser persistence, no native deps
builder.Services.AddSingleton(new IndexedDbDocumentStoreOptions
{
    DatabaseName = "StridellStoreDb",
    Version = 1
}.MapTypeToStore<GamesObject>()
//.MapFullTextProperty<GamesObject>(x => x.GameName, FullTextLanguage.English)
);

builder.Services.AddSingleton<IDocumentStore, IndexedDbDocumentStore>();

builder.Services.AddScoped<Istore, StoreRepository>();
builder.Services.AddScoped<IbrowserStore,  BrowserStoreRepository>();


// 2. Register the Supabase Client as a Singleton
builder.Services.AddSingleton(provider =>
    new Supabase.Client(supabaseUrl, supabaseKey, new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = false
    })
);

// Register the service that listens to the network status
builder.Services.AddScoped<NetworkConnectivity>();


builder.Services.AddOidcAuthentication(options =>
{
    // Configure your authentication provider options here.
    // For more information, see https://aka.ms/blazor-standalone-auth
    builder.Configuration.Bind("Local", options.ProviderOptions);
});

// Register Authentication Services
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<AuthenticationStateProvider, SupabaseAuthStateProvider>();


await builder.Build().RunAsync();
