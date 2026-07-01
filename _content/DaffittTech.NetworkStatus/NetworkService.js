window.networkStatus = {
    dotNetObject: null,
    initialize: function (dotNetObject) {
        // Register the DoNetObject to which this applies
        this.dotNetObject = dotNetObject;
    },
    // This is called on demand to check the status of the network
    async getStatusAsync(tmeout) {
        if (!tmeout || tmeout < 0) {tmeout = 1.0 } // Default to 1 second
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutID = setTimeout(() => controller.abort(), tmeout * 1000);
        try {
            // Ping a Google service to see if the Internet is active.
            await fetch('https://www.google.com/generate_204', { method: 'HEAD', mode: 'no-cors', signal });
            clearTimeout(timeoutID);
            return true;
        } catch (error) {
            clearTimeout(timeoutID);
            return false;
        }
    },
    // This is called periodically to check the status of the network and notify the .NET object if it changes
    // as part of the monitorStatus function's operation below.
    fetchStatus: function (timeout) {
        if (!timeout || timeout < 0) { timeout = 1.0; }
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutID = setTimeout(() => controller.abort(), timeout * 1000);

        fetch('https://www.google.com/generate_204', { method: 'HEAD', mode: 'no-cors', signal })
            .then(() => {
                clearTimeout(timeoutID);
                // In no-cors mode, we can't inspect the response, so assume online if fetch resolves
                window.networkStatus.notifyStatusChanged(true);
            })
            .catch(() => {
                clearTimeout(timeoutID);
                window.networkStatus.notifyStatusChanged(false);
            });
    },
    // This is called to start or stop monitoring the network status
    monitorStatus: function (interval, timeout) {
        if (interval && interval > 0) {
            if (!timeout || timeout < 0) { timeout = 1.0; } // Default timeout of 1 second
            // Pass a function reference to setInterval so fetchStatus is called repeatedly
            this.intervalId = setInterval(() => this.fetchStatus(timeout), interval * 1000);
        }
        else { clearInterval(this.intervalId); }
    },
    // This is called to notify the .NET object of a status change
    notifyStatusChanged: function (status) {
        if (this.dotNetObject && typeof status === "boolean") {
            this.dotNetObject.invokeMethodAsync("NotifyNetworkStatusChanged", status);
        }
    },
    // This is called to clean up the object when it is no longer needed
    dispose: function () {
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);
        this.dotNetObject = null;
    },
};
