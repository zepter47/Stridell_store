using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Supabase.Gotrue;
using static Supabase.Gotrue.Constants;

namespace Stridell_Origins.Services.Auth
{
    public class SupabaseAuthStateProvider : AuthenticationStateProvider
    {
        private readonly Supabase.Client _supabaseClient;
        private bool _isInitialized = false;

        public SupabaseAuthStateProvider(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;

            // Listen to Supabase background events (Login, Token Refresh, Logout)
            _supabaseClient.Auth.AddStateChangedListener(OnAuthStateChanged);
        }

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            // Try to recover the session from local storage on first load
            if (!_isInitialized)
            {
                await _supabaseClient.InitializeAsync();
                _isInitialized = true;
            }

            var session = _supabaseClient.Auth.CurrentSession;
            if (session?.User == null)
            {
                return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
            }

            return CreateAuthenticationState(session.User);
        }

        private void OnAuthStateChanged(object sender, AuthState authState)
        {
            var identity = authState switch
            {
                AuthState.SignedIn or AuthState.TokenRefreshed => CreateIdentity(_supabaseClient.Auth.CurrentUser),
                _ => new ClaimsIdentity() // SignedOut / Unauthenticated
            };

            var user = new ClaimsPrincipal(identity);
            NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(user)));
        }

        private AuthenticationState CreateAuthenticationState(User user)
        {
            return new AuthenticationState(new ClaimsPrincipal(CreateIdentity(user)));
        }

        private ClaimsIdentity CreateIdentity(User user)
        {
            if (user == null) return new ClaimsIdentity();

            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
        };

            // If you store user roles in Supabase user_metadata (e.g., {"role": "admin"})
            if (user.UserMetadata != null && user.UserMetadata.TryGetValue("role", out var roleObj))
            {
                claims.Add(new Claim(ClaimTypes.Role, roleObj.ToString() ?? "user"));
            }

            return new ClaimsIdentity(claims, "SupabaseAuth");
        }
    }
}
