chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'User-Agent') {
                details.requestHeaders[i].value = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Mobile Safari/537.36";
                break;
            }
        }
        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: ["<all_urls>"]
    },
    ["blocking", "requestHeaders"]);

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.local.set({
        instagram_mobile_web: 'mobile'
    }, function () {});
});