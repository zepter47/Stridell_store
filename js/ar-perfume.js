// (function () {
//     const params = new URLSearchParams(window.location.search);

//     // Only run during Android Runner experiments.
//     // Normal users visiting origins.stridell.org will not trigger this.
//     if (params.get("ar_perfume") !== "1") {
//         return;
//     }

//     const endpoint =
//         params.get("perfume_endpoint") ||
//         params.get("amp;perfume_endpoint") ||
//         window.AR_PERFUME_ENDPOINT ||
//         "https://ar-perfume.stridell.org/";

//     if (!endpoint) {
//         console.warn("Android Runner Perfume endpoint is missing.");
//         return;
//     }

//     const perfumeResults = [];

//     function normalizeMetricName(metricName) {
//         const map = {
//             "FP": "fp",
//             "FCP": "fcp",
//             "FID": "fid",
//             "LCP": "lcp",
//             "CLS": "cls",
//             "TBT": "tbt",
//             "TTFB": "ttfb",
//             "INP": "inp"
//         };

//         return map[metricName] || metricName;
//     }

//     function analyticsTracker(options) {
//         const metric = Object.assign({}, options);

//         metric.metricName = normalizeMetricName(metric.metricName);

//         if (!metric.eventProperties) {
//             metric.eventProperties = {};
//         }

//         if (!metric.navigatorInformation) {
//             metric.navigatorInformation = {};
//         }

//         perfumeResults.push(metric);

//         console.log("AR Perfume metric:", metric.metricName, metric.data);
//     }

//     function startPerfume() {
//         try {

//             const perfumeOptions = {
//                 analyticsTracker: analyticsTracker,
//                 resourceTiming: false,
//                 maxMeasureTime: 30000,
//                 reportOptions: {
//                     lcp: {
//                         reportAllChanges: true
//                     },
//                     cls: {
//                         reportAllChanges: true
//                     },
//                     inp: {
//                         reportAllChanges: true
//                     }
//                 }
//             }

//             if (window.perfume && typeof window.perfume.initPerfume === "function") {
//                 window.perfume.initPerfume(perfumeOptions);
//                 return;
//             }

//             if (window.Perfume && typeof window.Perfume.initPerfume === "function") {
//                 window.Perfume.initPerfume(perfumeOptions);
//                 return;
//             }

//             if (typeof window.initPerfume === "function") {
//                 window.initPerfume(perfumeOptions);
//                 return;
//             }

//             if (typeof window.Perfume === "function") {
//                 new window.Perfume(perfumeOptions);
//                 return;
//             }

//             console.warn("Perfume.js library was not found.");

//         } catch (error) {
//             console.error("Failed to start Perfume.js:", error);
//         }
//     }

//     function postPerfumeResults(reason) {
//         try {
//             const body = JSON.stringify({
//                 perfumeResults: perfumeResults
//             });

//             console.log("Posting Android Runner Perfume results:", reason, perfumeResults);

//             if (navigator.sendBeacon) {
//                 const blob = new Blob([body], {
//                     type: "text/plain;charset=UTF-8"
//                 });

//                 const ok = navigator.sendBeacon(endpoint, blob);

//                 console.log("AR Perfume sendBeacon result:", ok);

//                 if (ok) {
//                     return;
//                 }
//             }

//             const req = new XMLHttpRequest();
//             req.open("POST", endpoint, true);
//             req.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
//             req.send(body);

//         } catch (error) {
//             console.error("Failed to post Perfume.js results:", error);
//         }
//     }

//     // Start collecting Perfume.js metrics.
//     startPerfume();

//     // Send results deterministically during Android Runner execution.

//     setTimeout(function () {
//         postPerfumeResults("single-final-post");
//     }, 20000);

//     //setTimeout(function () {
//     //    postPerfumeResults("after-3-seconds");
//     //}, 3000);

//     //setTimeout(function () {
//     //    postPerfumeResults("after-8-seconds");
//     //}, 8000);

//     //window.addEventListener("load", function () {
//     //    setTimeout(function () {
//     //        postPerfumeResults("load-plus-delay");
//     //    }, 7000);
//     //});

//     document.addEventListener("visibilitychange", function () {
//         if (document.visibilityState === "hidden") {
//             postPerfumeResults("page-hidden");
//         }
//     });

//     // Android Runner / CDP can call this at the end of an offline run
//     // after Chrome network is restored.
//     window.ARPerfumePostNow = postPerfumeResults;
// })();

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

    /*
        Important:
        Keep perfumeResults as an array because your Android Runner
        Perfume.js server is already recognising metrics from this shape.

        But expose the same array globally so the restore_proxy_online.py
        script can see whether metrics exist before posting.
    */
    window.ARPerfumeResults = window.ARPerfumeResults || [];
    const perfumeResults = window.ARPerfumeResults;

    /*
        For offline proxy experiments, use this URL:

        https://origins.stridell.org/?ar_perfume=1&ar_manual_post=1

        That prevents the automatic 20-second post while the proxy is still offline.
        The restore_proxy_online.py script will call window.ARPerfumePostNow(...)
        after internet is restored.
    */
    const manualPostOnly = params.get("ar_manual_post") === "1";

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

    function getMetricNames() {
        return perfumeResults
            .map(function (metric) {
                return metric && metric.metricName ? metric.metricName : null;
            })
            .filter(function (metricName) {
                return metricName !== null;
            });
    }

    function buildMetricMap() {
        const metricMap = {};

        perfumeResults.forEach(function (metric) {
            if (metric && metric.metricName) {
                metricMap[metric.metricName] = metric;
            }
        });

        return metricMap;
    }

    /*
        Supports both Perfume.js callback styles:

        1. analyticsTracker(options)
        2. analyticsTracker(metricName, data, eventProperties)

        This avoids breaking if Perfume.js sends a slightly different shape.
    */
    function analyticsTracker(metricNameOrOptions, data, eventProperties) {
        let metric;

        if (
            metricNameOrOptions &&
            typeof metricNameOrOptions === "object" &&
            !Array.isArray(metricNameOrOptions)
        ) {
            metric = Object.assign({}, metricNameOrOptions);
        } else {
            metric = {
                metricName: metricNameOrOptions,
                data: data,
                eventProperties: eventProperties || {}
            };
        }

        metric.metricName = normalizeMetricName(metric.metricName);

        if (!metric.eventProperties) {
            metric.eventProperties = {};
        }

        if (!metric.navigatorInformation) {
            metric.navigatorInformation = {};
        }

        metric.capturedAt = Date.now();

        perfumeResults.push(metric);

        // Keep the global reference updated for CDP/Android Runner restore script.
        window.ARPerfumeResults = perfumeResults;

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
            };

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
            const metricNames = getMetricNames();

            console.log("Perfume post requested:", reason, metricNames);

            /*
                Very important:
                Do not post empty metrics.

                Empty posts are what caused Android Runner to create misleading
                fcp/lcp CSV files with value 0.
            */
            if (metricNames.length === 0) {
                console.warn("Perfume post skipped because no metrics were captured yet.");

                return {
                    ok: false,
                    reason: reason,
                    message: "no-metrics",
                    metricNames: metricNames
                };
            }

            const body = JSON.stringify({
                perfumeResults: perfumeResults,

                // Extra copy in object form for easier debugging / future parsing.
                perfumeResultsByName: buildMetricMap(),

                metricNames: metricNames,
                reason: reason,
                href: window.location.href,
                postedAt: Date.now()
            });

            console.log("Posting Android Runner Perfume results:", reason, perfumeResults);

            if (navigator.sendBeacon) {
                const blob = new Blob([body], {
                    type: "text/plain;charset=UTF-8"
                });

                const ok = navigator.sendBeacon(endpoint, blob);

                console.log("AR Perfume sendBeacon result:", ok);

                if (ok) {
                    return {
                        ok: true,
                        method: "sendBeacon",
                        reason: reason,
                        metricNames: metricNames
                    };
                }
            }

            const req = new XMLHttpRequest();
            req.open("POST", endpoint, true);
            req.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            req.send(body);

            return {
                ok: true,
                method: "XMLHttpRequest",
                reason: reason,
                metricNames: metricNames
            };

        } catch (error) {
            console.error("Failed to post Perfume.js results:", error);

            return {
                ok: false,
                reason: reason,
                error: String(error)
            };
        }
    }

    // Expose helpers for Android Runner / CDP restore script.
    window.ARPerfumePostNow = postPerfumeResults;
    window.ARPerfumeGetMetricNames = getMetricNames;
    window.ARPerfumeGetResults = function () {
        return perfumeResults;
    };

    // Start collecting Perfume.js metrics.
    startPerfume();

    /*
        For normal online/cloud runs:
        Automatically post at 20 seconds.

        For offline proxy runs:
        Add &ar_manual_post=1 to the URL so this automatic post is disabled.
        The restore_proxy_online.py script will post after the proxy is removed.
    */
    if (!manualPostOnly) {
        setTimeout(function () {
            postPerfumeResults("single-final-post");
        }, 20000);

        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "hidden") {
                postPerfumeResults("page-hidden");
            }
        });
    }

})();