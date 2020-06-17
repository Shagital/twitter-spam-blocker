// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason == "install") {
        let block_twitter = {
            block_trend: false,
            hide_delete: false,
            block_category: false,
            block_location: false,
            block_tweet: false,
            blocked_words: "",
            blocked_categories: "",
            blocked_locations: "",
            block_regex: "",
        }
        chrome.storage.local.set({
            twitter_block: block_twitter
        });
    }
});
