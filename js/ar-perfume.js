(function () {
    const params = new URLSearchParams(window.location.search);

    // Only run during Android Runner experiments.
    // Normal users visiting origins.stridell.org will not trigger this.
    if (params.get("ar_perfume") !== "1") {
        return;
    }

    const endpoint =
        params.get("perfume_endpoint") ||
        params.get("amp;perfume_endpoint") ||
        window.AR_PERFUME_ENDPOINT ||
        "https://ar-perfume.stridell.org/";

    if (!endpoint) {
        console.warn("Android Runner Perfume endpoint is missing.");
        return;
    }

    const perfumeResults = [];

    function normalizeMetricName(metricName) {
        const map = {
            "FP": "fp",
            "FCP": "fcp",
            "FID": "fid",
            "LCP": "lcp",
            "CLS": "cls",
            "TBT": "tbt",
            "TTFB": "ttfb",
            "INP": "inp"
        };

        return map[metricName] || metricName;
    }

    function analyticsTracker(options) {
        const metric = Object.assign({}, options);

        metric.metricName = normalizeMetricName(metric.metricName);

        if (!metric.eventProperties) {
            metric.eventProperties = {};
        }

        if (!metric.navigatorInformation) {
            metric.navigatorInformation = {};
        }

        perfumeResults.push(metric);

        console.log("AR Perfume metric:", metric.metricName, metric.data);
    }

    function startPerfume() {
        try {

            const perfumeOptions = {
                analyticsTracker: analyticsTracker,
                resourceTiming: false,
                maxMeasureTime: 30000,
                reportOptions: {
                    lcp: {
                        reportAllChanges: true
                    },
                    cls: {
                        reportAllChanges: true
                    },
                    inp: {
                        reportAllChanges: true
                    }
                }
            }

            if (window.perfume && typeof window.perfume.initPerfume === "function") {
                window.perfume.initPerfume(perfumeOptions);
                return;
            }

            if (window.Perfume && typeof window.Perfume.initPerfume === "function") {
                window.Perfume.initPerfume(perfumeOptions);
                return;
            }

            if (typeof window.initPerfume === "function") {
                window.initPerfume(perfumeOptions);
                return;
            }

            if (typeof window.Perfume === "function") {
                new window.Perfume(perfumeOptions);
                return;
            }

            console.warn("Perfume.js library was not found.");

        } catch (error) {
            console.error("Failed to start Perfume.js:", error);
        }
    }

    function postPerfumeResults(reason) {
        try {
            const body = JSON.stringify({
                perfumeResults: perfumeResults
            });

            console.log("Posting Android Runner Perfume results:", reason, perfumeResults);

            if (navigator.sendBeacon) {
                const blob = new Blob([body], {
                    type: "text/plain;charset=UTF-8"
                });

                const ok = navigator.sendBeacon(endpoint, blob);

                console.log("AR Perfume sendBeacon result:", ok);

                if (ok) {
                    return;
                }
            }

            const req = new XMLHttpRequest();
            req.open("POST", endpoint, true);
            req.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            req.send(body);

        } catch (error) {
            console.error("Failed to post Perfume.js results:", error);
        }
    }

    // Start collecting Perfume.js metrics.
    startPerfume();

    // Send results deterministically during Android Runner execution.

    setTimeout(function () {
        postPerfumeResults("single-final-post");
    }, 20000);

    //setTimeout(function () {
    //    postPerfumeResults("after-3-seconds");
    //}, 3000);

    //setTimeout(function () {
    //    postPerfumeResults("after-8-seconds");
    //}, 8000);

    //window.addEventListener("load", function () {
    //    setTimeout(function () {
    //        postPerfumeResults("load-plus-delay");
    //    }, 7000);
    //});

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
            postPerfumeResults("page-hidden");
        }
    });

    // Android Runner / CDP can call this at the end of an offline run
    // after Chrome network is restored.
    window.ARPerfumePostNow = postPerfumeResults;
})();