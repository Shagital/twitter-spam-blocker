$(document).ready(function () {
    // alert('Ok bummber');
    var blocked_hashtags = new Tags('#blocked_words');
    var blocked_categories = new Tags('#blocked_categories');
    var blocked_locations = new Tags('#blocked_locations');

    $('.select-content').click(function (e) {
        // e.preventDefault();
        let attr = $(this).attr('data-attr');
        let id = '#dropdown' + attr;
        $(id).toggle();
    })
    chrome.storage.local.get(['twitter_block'], function (object) {
        let twitter_block = object.twitter_block

        let hide_delete = twitter_block.hide_delete || 1;
        hide_delete == 2 ? $('#hide').prop("checked", true) : $('#delete').prop("checked", true)


        blocked_hashtags.addTags(twitter_block.blocked_words.split(','));
        blocked_categories.addTags(twitter_block.blocked_categories.split(','));
        blocked_locations.addTags(twitter_block.blocked_locations.split(','));
        $('#block_regex').val(twitter_block.block_regex);
    });

    $("#submitBtn").click(function (e) {
        // e.preventDefault();
        $('#info').show()

        let block_regex = $('#block_regex').val()
        let blocked_words = $('#blocked_words').val()

        let blocked_categories = $('#blocked_categories').val()
        let blocked_locations = $('#blocked_locations').val()
        let hide_delete = $("input[name='hide_delete']:checked").val();
        // alert(hide_delete);
        let block_twitter = {
            hide_delete: hide_delete,
            block_regex: block_regex,
            blocked_words: blocked_words,
            blocked_categories: blocked_categories,
            blocked_locations: blocked_locations,
        }
        console.log(block_twitter);
        // alert("ok")
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
