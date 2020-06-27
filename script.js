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

var tweetClass = 'article';
var regexObj = {};
var hashtagLimit = 1;


function checkAndStartWatching() {
    chrome.storage.local.get(['twitter_block'], function (object) {
        let twitter_block = object.twitter_block

        blockTweetRegex = twitter_block.block_regex || '';
        //console.warn('regex', blockTweetRegex);
        deleteHide = twitter_block.hide_delete || 1;
        hashtagLimit = twitter_block.hashtag_limit || 1;

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
            blockedTrendWords.length
            || blockedLocations.length
            || blockedCategories.length
            || deleteHide === 2
        ) startWatching();
    });
}

function startWatching() {
    window.setInterval(function () {
        grabTrends().then((trends) => {
            deleteBlocked(trends);
            grabTweets();
        });
    }, 100);
}

async function grabTrends() {
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
        for (let trendChild of trendchildren) {
            if (!trendingList.includes(trendChild.textContent)) {
                trendingList.push(trendChild.textContent);
            }
        }

        trendsDom = trendchildren;

        return trendchildren;
    }
    return [];
}

function grabTweets() {
    var tweetsCollection = document.getElementsByTagName(tweetClass);
    var tweets = Array.prototype.slice.call( tweetsCollection, 0 );

    let diff = tweets.filter(x => !tweetsDom.includes(x));
    if (diff.length) {
        //console.error(new Date().toTimeString(), diff)
        tweetsDom = tweets.map((x) => x);
        deleteTweet(tweets);
    }
}

function getNumberOfhashtagInTweet(trending, string) {
    let intercept = 0;
    for (let t of trending) {
        if (string.includes(t)) {
            intercept++;
        }
    }

    return intercept;
}

function deleteTweet(nodes) {
    for (let node of nodes) {
        let content = node.textContent.trim();

        let intercept = getNumberOfhashtagInTweet(trendingList, content);
        //console.warn('deleteHide', deleteHide, 'intercept', intercept, 'hashtagLimit', hashtagLimit);
        if (
            (blockTweetRegex && regexObj.test(content))
            || (
                deleteHide == 2
                && hashtagLimit
                && (
                    getNumberOfhashtagInTweet(trendingList, content) > hashtagLimit
                    || findHashtags(content) > hashtagLimit
                )
            )
        ) {
            // console.warn('got here');
            node.style.display = 'none';
        }

    }
}

function findHashtags(searchText) {
    var regexp = /(\s|^)\#\w\w+\b/gm
    let result = searchText.match(regexp);
    if (result) {
        result = result.map(function (s) {
            return s.trim();
        });
        //console.log(result);
        return result.length;
    }
    return 0;
}

function partialMatch(blockedTrendWords, content) {
    for (let word of blockedTrendWords) {
        if (word.includes(content) || content.includes(word)) return true;
    }
    return false
}

function deleteBlocked(nodes) {
    for (let node of nodes) {
        let content = node.textContent.trim().toLowerCase();
        let trendingText = node.parentNode.children[0].textContent;
        let location = getLocation(trendingText);
        let category = getCategory(trendingText);

        if (
            (partialMatch(blockedTrendWords, content))
            || (location && blockedLocations.includes(location))
            || (category && blockedCategories.includes(category))
        ) {
            node.parentNode.parentNode.parentNode.removeChild(node.parentNode.parentNode)
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
