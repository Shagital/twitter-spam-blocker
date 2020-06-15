fetch('https://twitter.com/home').then((response) => {
    // When the page is loaded convert it to text
    // console.log('Page loaded');
    return response.text()
})
    .then(async (html) => {
        // Initialize the DOM parser
        const parser = new DOMParser();

        // Parse the text
        let document = parser.parseFromString(html, "text/html");
        var trends = document.querySelector('div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010.main.div.div.div.div.css-1dbjc4n.r-aqfbo4.r-zso239.r-1hycxz > div > div.css-1dbjc4n.r-gtdqiz.r-1hycxz > div > div > div > div:nth-child(3) > div > div > section > div > div > div > div');
        var tweets = document.querySelector('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-yfoy6g.r-18bvks7.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div > section > div > div > div').children;

    });
