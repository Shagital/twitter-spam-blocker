document.addEventListener('DOMContentLoaded', () => {
    const checkPageButton = document.querySelectorAll('#sw');
    chrome.storage.local.get(['instagram_mobile_web'], function (obj) {
        let result = obj.instagram_mobile_web
        // checkPageButton.checked = (result === 'mobile');
        //loop through and check if data name matches local then make active
        checkPageButton.forEach((btn) => {
            console.log(btn.dataset, result)
            if (btn.dataset.name === result) {
                btn.classList.add('active');
            }
        })
    });

    checkPageButton.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            //now toggle the active class here
            checkPageButton.forEach(s => {
                // console.log(s);
                s.classList.remove('active');
                if (s == event.target) {
                    //do something 
                    btn.classList.add('active');
                }
            })
            let content = btn.dataset.name;
            chrome.storage.local.set({
                instagram_mobile_web: content
            }, function () {});
        }, false);
    });
}, false);

chrome.storage.onChanged.addListener(function (changes, namespace) {
    console.log('Something Changed')
    for (var key in changes) {
        if (key === 'instagram_mobile_web') {
            chrome.tabs.reload();
        }
    }
});
