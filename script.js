;(function() {
    function script() {
        // your main code here
        Object.defineProperty(window.navigator, 'userAgent', {
            get: function () { return "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Mobile Safari/537.36"; }
        });
    }

    async function inject(fn) {
        await chrome.storage.local.get(['instagram_mobile_web'], function(object) {
            let setting = object.instagram_mobile_web;
            if (setting === 'mobile') {
                console.warn('fetched setting', setting);
                const script = document.createElement('script');
                script.text = `(${fn.toString()})();`;
                let theParent = document.head;
                theParent.insertBefore(script, theParent.firstChild);
            }
        });
    }

    inject(script)
})()
