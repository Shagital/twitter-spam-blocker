var blockTrendWord = false;
var blockLocation = false;
var blockCategory = false;
var blockTweet = false;

var deleteHide = false;

var trendingList = [];
var blockedTrendWords = [];
var blockedLocations = [];
var blockedCategories = [];
var blockTweetRegex = '';

var trendsDom = [];
var tweetsDom = [];

var trendClass = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-aqfbo4.r-zso239.r-1hycxz > div > div.css-1dbjc4n.r-gtdqiz.r-1hycxz > div > div > div > div.css-1dbjc4n.r-1uaug3w.r-1uhd6vh.r-t23y2h.r-1phboty.r-rs99b7.r-ku1wi2.r-1udh08x > div > div > section > div > div > div > div';
var hashtagClass = 'div.css-901oao.r-jwli3a.r-1qd0xha.r-a023e6.r-vw2c0b.r-ad9z0x.r-bcqeeo.r-vmopo1.r-qvutc0';

var tweetClass = 'div.css-901oao.r-jwli3a.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0';
var regexObj = {};


function checkAndStartWatching() {
    chrome.storage.local.get(['twitter_block'], function (object) {
        let twitter_block = object.twitter_block

        blockTrendWord = twitter_block.block_trend || false;
        blockLocation = twitter_block.block_location || false;
        blockCategory = twitter_block.block_category || false;
        blockTweet = twitter_block.block_tweet || false;
        blockTweetRegex = twitter_block.block_regex || '';
        deleteHide = twitter_block.hide_delete || 1;

        blockedTrendWords = twitter_block.blocked_words
            ? twitter_block.blocked_words.toLowerCase().split(',').map(s => s.trim())
            : [];
        blockedLocations = twitter_block.blocked_locations
            ? twitter_block.blocked_locations.toLowerCase().split(',').map(s => s.trim())
            : [];
        blockedCategories = twitter_block.blocked_categories
            ? twitter_block.blocked_categories.toLowerCase().split(',').map(s => s.trim())
            : [];

        regexObj = RegExp(blockTweetRegex);
        if (
            (blockTrendWord && blockedTrendWords.length)
            || (blockLocation && blockedLocations.length)
            || (blockCategory && blockedCategories.length)
        ) startWatching();
    });
}

function startWatching() {
    window.setInterval(function () {
        grabTrends();
        if (blockTweet) grabTweets();
    }, 100);
}

function grabTrends() {
    var trend = document.querySelector(trendClass)

    // sometimes null is returned
    var trendchildren = trend ? trend.querySelectorAll(hashtagClass) : [];
    trendchildren = Array.from(trendchildren);

    // only perform action if dom content has changed and there are actual nodes
    let diff = trendchildren.filter(x => !trendsDom.includes(x));
    if (
        trendchildren.length
        && diff.length
    ) {
        // let's save trending hashtag
        // TODO: Not in use
        // for (let trendChild of trendchildren) {
        //     if (!trendingList.includes(trendChild.textContent)) {
        //         trendingList.push(trendChild.textContent);
        //     }
        // }

        trendsDom = trendchildren;
        deleteBlocked(trendchildren);
    }
}

function grabTweets() {
    var tweet = document.querySelectorAll(tweetClass);
    var actualTweets = [];
    var tweetTexts = [];

    // we want to remove quote tweets
    for (let t of tweet) {
        tweetTexts.push(t.textContent)
        let calClass = 'div.' + t.className.replace(/ /g, ".")
        if (calClass == tweetClass) actualTweets.push(t);
    }

    let diff = tweetTexts.filter(x => !tweetsDom.includes(x));
    if (
        actualTweets.length
        && diff.length
    ) {
        //console.error(new Date().toTimeString(), diff)
        tweetsDom = tweetTexts.map((x) => x);
        deleteTweet(actualTweets);
    }
}


function deleteTweet(nodes) {
    for (let node of nodes) {
        let content = node.textContent.trim();

        //console.warn('regex', regexObj, 'text', 'result', content, regexObj.test(content))
        if (regexObj.test(content)) {
            if (deleteHide === 2) {
                node.style.display = 'none'
            } else {
                node.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(node.parentNode.parentNode.parentNode.parentNode);
            }
        }

    }
}

function deleteBlocked(nodes) {
    for (let node of nodes) {
        let content = node.textContent.trim().toLowerCase();
        let trendingText = node.parentNode.children[0].textContent;
        let location = getLocation(trendingText);
        let category = getCategory(trendingText);

        if (
            (blockTrendWord && blockedTrendWords.includes(content))
            || (location && blockLocation && blockedLocations.includes(location))
            || (category && blockCategory && blockedCategories.includes(category))
        ) {
            if (deleteHide === 2) {
                node.style.display = 'none'
            } else {
                node.parentNode.parentNode.parentNode.removeChild(node.parentNode.parentNode)
            }
        }

    }
}

function getLocation(string) {
    let replacedText = string.includes('Trending in') ? string.replace('Trending in ', '') : false;
    return replacedText ? replacedText.trim().toLowerCase() : null;
}

function getCategory(string) {
    let splitText = string ? string.split('·') : false;
    return (splitText && splitText.length === 2) ? splitText[0].trim().toLowerCase() : null;
}


checkAndStartWatching();
