


window.network = {
    checkConnectivity: async function (timeoutMs = 5000) {
        // Short-circuit: If the device says it's offline, 
        // don't waste time/battery trying to ping Google.
        if (!navigator.onLine) {
            return false;
        }

        // If navigator says we might be online, run the real check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            await fetch('https://www.gstatic.com/generate_204', {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return true;
        } catch (err) {
            clearTimeout(timeoutId);
            return false;
        }
    }
};


window.addEventListener('online', () => console.log('online event fired'));
window.addEventListener('offline', () => console.log('offline event fired'));
