const API_KEY = '7268ce09beb78674bc76ffde9a9afb03'
var genres = [
    {
        "id": 28,
        "name": "Action"
    },
    {
        "id": 12,
        "name": "Adventure"
    },
    {
        "id": 16,
        "name": "Animation"
    },
    {
        "id": 35,
        "name": "Comedy"
    },
    {
        "id": 80,
        "name": "Crime"
    },
    {
        "id": 99,
        "name": "Documentary"
    },
    {
        "id": 18,
        "name": "Drama"
    },
    {
        "id": 10751,
        "name": "Family"
    },
    {
        "id": 14,
        "name": "Fantasy"
    },
    {
        "id": 36,
        "name": "History"
    },
    {
        "id": 27,
        "name": "Horror"
    },
    {
        "id": 10402,
        "name": "Music"
    },
    {
        "id": 9648,
        "name": "Mystery"
    },
    {
        "id": 10749,
        "name": "Romance"
    },
    {
        "id": 878,
        "name": "Science Fiction"
    },
    {
        "id": 10770,
        "name": "TV Movie"
    },
    {
        "id": 53,
        "name": "Thriller"
    },
    {
        "id": 10752,
        "name": "War"
    },
    {
        "id": 37,
        "name": "Western"
    }
]

document.addEventListener('DOMContentLoaded', function () {
    var checkPageButton = document.getElementById('checkPage');
    checkPageButton.addEventListener('click', function () {
        checkPageButton.setAttribute('disabled', true);
        console.log('Button Clicked');
        chrome.tabs.getSelected(null, function (tab) {
            let url = tab.url;
            console.log('Current URL: ', url);
            if (url.indexOf('netflix.com') !== -1) {
                localStorage.setItem('fetching', true);
                console.log('fetching viewing history');
                fetchSuggestedMovies();
            }
        });
    }, false);
}, false);

function fetchViewingHistory() {
    fetch('https://www.netflix.com/viewingactivity')
        .then(function (response) {
            // When the page is loaded convert it to text
            console.log('Page loaded');
            return response.text()
        })
        .then(function (html) {
            console.log('Getting DOM...');
            // Initialize the DOM parser
            var parser = new DOMParser();

            // Parse the text
            var doc = parser.parseFromString(html, "text/html");

            // scroll 100 times:
            let i = 0;
            while (i < 100) {
                console.log('Scrolling: ', i);
                let showMoreButton = doc.querySelector('button.btn.btn-blue.btn-small');
                if (showMoreButton.getAttribute('disabled')) {
                    console.log('Can no longer scroll');
                    break;
                } else {
                    showMoreButton.click()
                }
                i++;
            }
            console.log('Completed infinite scroll');
            parseViewHistory(doc)
        })
        .catch(function (err) {
            console.log('Failed to fetch page: ', err);
        }).then(() => {
        console.log('Clearing storage');
        localStorage.removeItem('fetching');
    });
}

function parseViewHistory(dom) {
    var items = dom.getElementsByClassName('retableRow')

    var movies = [];

    console.log('Looping through movies');
    for (let item of items) {
        let divs = item.getElementsByTagName('div');

        let title = divs[1].getElementsByTagName('a')[0].getAttribute('href')
        let id = title.split('/')[1]

        let movie = {
            'id': id,
            'date': divs[0].textContent,
            'title': divs[1].textContent.split('Season')[0].trim(),
            'url': "https://netflix.com" + title,
            'type': divs[1].textContent.indexOf('Season') !== -1 ? 'show' : 'movie'
        };

        movies.push(movie);
    }

    console.log(JSON.stringify(movies, null, 4))
}

function fetchSuggestedMovies() {
    fetch('https://www.netflix.com/browse')
        .then(function (response) {
            // When the page is loaded convert it to text
            console.log('Page loaded');
            return response.text()
        })
        .then(function (html) {
            console.log('Getting DOM...');
            // Initialize the DOM parser
            var parser = new DOMParser();

            // Parse the text
            var doc = parser.parseFromString(html, "text/html");

            // scroll to bottom
            infiniteScroll(doc);
            parseSuggestMovies(doc)
        }).catch((error) => {
        console.error(error)
    })
}

function parseSuggestMovies(dom) {
    console.log('Parsing suggested movies...');
    let string = dom.getElementsByTagName('script')[4].textContent
    string = string.split('netflix.falcorCache = ')[1].split(';</script>')[0];
    let formattedString = replaceAll(string).slice(0, -1);

    let jsonData = JSON.parse(formattedString)
    let videos = [];

    let videosColumn = jsonData['videos']

    Object.keys(videosColumn).forEach(function (key) {
        if (videosColumn[key].summary && videosColumn[key].title && videosColumn[key].boxarts) {
            let video = {
                id: key,
                type: videosColumn[key].summary.value.type,
                url: "https://netflix.com/title/" + key,
                title: videosColumn[key].title.value,
                banner: videosColumn[key].boxarts._342x192.jpg.value.url,
            }

            videos.push(video)
        }

    });

    enrichHTML(videos)
}

function enrichHTML(videos) {
    console.log('Enriching HTML...');
    let html = ''
    Object.keys(videos).forEach((key) => {
        html += ` <div class="col-xs-3">
            <figure>
                <a href="${videos[key].url}"><img src="${videos[key].banner}" alt="${videos[key].title}">
                </a>
                <figcaption>${videos[key].title} (${videos[key].type})</figcaption>
            </figure>
        </div>`
    });

    let contentArea = document.getElementById('netflix-content');
    contentArea.innerHTML = html
    contentArea.style.display = "block";
}

function infiniteScroll(dom) {
    console.log('Infinite scroll...');
    for (var i = 1; i < 100; i += 1) {
        window.scrollTo(0, dom.body.scrollHeight);
    }
    return true;
}

function replaceAll(str) {
    let codes = {
        "\\x24": '$',
        "\\x2F": '/',
        '\\x3D': '=',
        '\\x3F': '?',
        '\\x7C': '|',
        '\\x20': ' ',
        '\\x3B': ';',
        '\\x26': '&',
        '\\x2B': '+',
        '\\x28': '(',
        '\\x29': ')',
        '\\x23': '#',
        '\\x27': "'",
    }
    Object.keys(codes).forEach((ascii) => {
        str = str.replace(new RegExp(escapeRegExp(ascii), 'g'), codes[ascii]);
    });

    return str;
}

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function searchMovies(title) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${title}&language=en-US&page=1&include_adult=false`)
        .then(function (response) {
            // When the page is loaded convert it to text
            let sample_response = {
                "page": 1,
                "total_results": 13,
                "total_pages": 1,
                "results": [
                    {
                        "popularity": 5.882,
                        "vote_count": 29,
                        "video": false,
                        "poster_path": "/5p1Ul3Xfg08zWQkY1cwJS8pFk21.jpg",
                        "id": 407626,
                        "adult": false,
                        "backdrop_path": "/2NBhOFCNfqITOjE2l0mr4sg9P7j.jpg",
                        "original_language": "en",
                        "original_title": "Ozark Sharks",
                        "genre_ids": [
                            28,
                            27,
                            878,
                            53,
                            10770
                        ],
                        "title": "Ozark Sharks",
                        "vote_average": 4,
                        "overview": "A picturesque family vacation to the Ozarks goes sideways when a group of bull sharks show up just in time for the big fireworks festival that the town holds every year.",
                        "release_date": "2016-07-30"
                    },
                ]
            }
        })
        .catch(function (err) {
            console.log('Failed to fetch page: ', err);
        }).then(() => {
        console.log('Clearing storage');
        localStorage.removeItem('fetching');
    });
}
