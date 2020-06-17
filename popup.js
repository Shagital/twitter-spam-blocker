$(document).ready(function () {
    chrome.storage.local.get(['twitter_block'], function (object) {
        let twitter_block = object.twitter_block

        let block_trend = twitter_block.block_hashtags || false
        $('#block_trend').prop("checked", block_trend);
        let el = $(`#block_trend_form`)
        block_trend ? el.show() : el.hide();

        let block_category = twitter_block.block_category || false;
        $('#block_category').prop("checked", block_category);
        let el2 = $(`#block_category_form`)
        block_category ? el2.show() : el2.hide();

        let block_location = twitter_block.block_location || false;
        $('#block_location').prop("checked", block_location);
        let el3 = $(`#block_location_form`)
        block_location ? el3.show() : el3.hide();

        let hide_delete = twitter_block.hide_delete || false;
        $('#hide_delete').prop("checked", hide_delete);

        $('#blocked_words').val(twitter_block.blocked_words);
        $('#blocked_categories').val(twitter_block.blocked_categories);
        $('#blocked_locations').val(twitter_block.blocked_locations);
    });

    $("#submitBtn").click(function () {
        $('#info').show()

        let block_trend = $('#block_trend').is(":checked")
        let block_category = $('#block_category').is(":checked")
        let block_location = $('#block_location').is(":checked")

        let blocked_words = $('#blocked_words').val()
        let blocked_categories = $('#blocked_categories').val()
        let blocked_locations = $('#blocked_locations').val()
        let hide_delete = $('#hide_delete').val()

        let block_twitter = {
            block_trend: !!(block_trend),
            hide_delete: !!(hide_delete),
            block_category: !!(block_category),
            block_location: !!(block_location),
            blocked_words: blocked_words,
            blocked_categories: blocked_categories,
            blocked_locations: blocked_locations,
        }
        chrome.storage.local.set({
            twitter_block: block_twitter
        });

        $('#info').hide()
        $('#success').show()
        setTimeout(() => {
            $('#success').hide();
            $('#error').hide();
            $('#info').hide()
        }, 2000);
    });

    $('#block_trend').change(function () {
        let el = $(`#block_trend_form`)
        $(this).is(':checked') ? el.show() : el.hide();
    });

    $('#block_location').change(function () {
        let el = $(`#block_location_form`)
        $(this).is(':checked') ? el.show() : el.hide();
    });

    $('#block_category').change(function () {
        let el = $(`#block_category_form`)
        $(this).is(':checked') ? el.show() : el.hide();
    });
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    //console.warn('Something Changed')
    for (var key in changes) {
        if (key === 'twitter_block') {
            window.close();
            chrome.tabs.reload();
        }
    }
});

