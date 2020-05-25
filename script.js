function sortItems() {
    console.log('sorting...')
    var items = $('#netflix-content > div.main')
    for (let item of items) {
        let id = item.id
        let elements = $(`#${id}`)

        // first we remove possible duplicates
        if (elements.length > 1) {
            for (let i = 0; i < elements.length; i++) {
                document.getElementById(elements[i].id).remove()
            }
        }
    }

    // then we re-order items so the top match comes first
    var $wrapper = $('#netflix-content');
    $wrapper.show();

    $wrapper.find('div.main').sort(function (a, b) {
            return +a.dataset.percentage - +b.dataset.percentage;
        })
        .appendTo($wrapper);

    // only leave 5 items present, remove the rest
    var unique_items = $('#netflix-content > div.main')
    let max = 5;
    for (let i = 0; i < unique_items.length; i++) {
        if (i >= max) {
            document.getElementById(unique_items[i].id).remove()
        }
    }


}

$('.big-desc').hide();
$('#checkPage').click(function () {
    $(this).css('display', 'none')
    $('.loader').css('display', 'block');
})
$(".h-link, .close").click(function () {
    $('.ovly').toggle();
})
$(document).on('click', '.short-desc', function () {
    //get id of short desc and remove s-
    let descId = $(this).attr("id");
    descId = descId.substring('2')
    let fullDesc = '#b-' + descId;
    console.log($(fullDesc))
    $(fullDesc).toggle();

});
