function sortItems() {
    var items = $('#netflix-content > a')
    for (let item of items) {
        console.log('item ', item)
        let id = item.id
        let elements = $(`#${id}`)

        // first we remove possible duplicates
        if (elements.length > 1) {
            for (let i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
        }
    }

    // then we re-order items so the top match comes first
    var $wrapper = $('#netflix-content');
    $wrapper.show();

    $wrapper.find('a').sort(function (a, b) {
        return +a.dataset.percentage - +b.dataset.percentage;
    })
        .appendTo($wrapper);

    // only leave 5 items present, remove the rest
    var unique_items = $('#netflix-content > a')
    let max = 5;
    for (let i = 0; i < unique_items.length; i++) {
        if (i >= max) {
            let id = unique_items[i].id
            $(`#${id}`).remove();
        }
    }


}
