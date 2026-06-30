using Microsoft.JSInterop;

namespace Stridell_Origins.Services
{
    public class NetworkConnectivity(IJSRuntime _js)
    {
        public async Task<bool> IsOnlineAsync()
        {
            try
            {

                //Calls the JS function we defined in index.html
                return await _js.InvokeAsync<bool>("network.checkConnectivity");

            }
            catch (Exception)
            {

                return false;
            }

        }
    }
}
