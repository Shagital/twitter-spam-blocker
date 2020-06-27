// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason == "install") {
        let block_twitter = {
            hide_delete: false,
            blocked_words: "",
            blocked_categories: "",
            blocked_locations: "",
            block_regex: "",
            hashtag_limit: 1,
        }
        chrome.storage.local.set({
            twitter_block: block_twitter
        });
    }
});
