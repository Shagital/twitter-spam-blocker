const API_KEY = '7268ce09beb78674bc76ffde9a9afb03';
const genres = [
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
];
const SUGGESTED = 1;
const VIEWED = 2;
const BASE_URL = "https://netflix.com";

document.addEventListener('DOMContentLoaded', () => {
    // we want to pre-fetch the suggested movies so it's available once user clicks the button
    chrome.tabs.getSelected(null, (tab) => {
        let url = tab.url;
        // console.log('Current URL: ', url);
        if (url.indexOf('netflix.com') !== -1) {
            localStorage.setItem('fetching', true);
            // console.log('fetching viewing history');
            new NeflixSuggest().getSuggestedAndViewingHistory().then(r => {
                console.log('say something nice');
            })
        }
    });

    const checkPageButton = document.getElementById('checkPage');
    checkPageButton.addEventListener('click', () => {
        checkPageButton.setAttribute('disabled', true);

        // now we can show what we have
        sortItems();
    }, false);
}, false);

class NeflixSuggest {
    constructor() {
        this.suggestedMovies = [];
        this.viewedMovies = [];
        this.filteredMovies = [];
    }

    async getSuggestedAndViewingHistory() {
        await this.fetchViewingHistory().then(async () => {
            await this.fetchSuggestedMovies().then(async () => {
                console.log('love me jeje')
            });
        });

    }

    fetchViewingHistory() {
        // console.log('Fetching viewing history...');
        return fetch('https://www.netflix.com/viewingactivity')
            .then((response) => {
                // When the page is loaded convert it to text
                // console.log('Page loaded');
                return response.text()
            })
            .then(async (html) => {
                // Initialize the DOM parser
                const parser = new DOMParser();

                // Parse the text
                let doc = parser.parseFromString(html, "text/html");

                // scroll 100 times:
                let i = 0;
                while (i < 100) {
                    // console.log('Scrolling: ', i);
                    let showMoreButton = doc.querySelector('button.btn.btn-blue.btn-small');
                    if (showMoreButton.getAttribute('disabled')) {
                        // console.log('Can no longer scroll');
                        break;
                    } else {
                        showMoreButton.click()
                    }
                    i++;
                }
                // console.log('Completed infinite scroll');
                await this.parseViewHistory(doc)
            })
            .catch((err) => {
                console.log('Failed to fetch viewing history: ', err);
            });
    }

    parseViewHistory(dom) {
        let items = dom.getElementsByClassName('retableRow');

        // console.log('Looping through viewing history...');
        for (let item of items) {
            let divs = item.getElementsByTagName('div');

            let title = divs[1].getElementsByTagName('a')[0].getAttribute('href');
            let id = title.split('/').pop();

            let movieTitle = divs[1].textContent.split('Season')[0].trim().replace(/:\s*$/, "");

            if (id && !this.viewedMovies[id]) {
                this.viewedMovies[id] = {
                    id: id,
                    date: divs[0].textContent,
                    title: movieTitle,
                    url: BASE_URL + title,
                    type: divs[1].textContent.indexOf('Season') !== -1 ? 'show' : 'movie',
                };

                this.searchMovie(movieTitle).then(async (movieId) => {
                    if (!movieId) return null;
                    await this.fetchMovie(movieId).then((meta) => {
                        this.viewedMovies[id].meta = meta
                    });
                    await this.fetchMovieCast(movieId).then((cast) => {
                        this.viewedMovies[id].casts = cast
                    });
                });
            }
        }

    }

    isEmpty(string) {
        return (!string || string.length === 0 || !string.trim());
    }

    fetchSuggestedMovies() {
        console.log(`Fetching Suggested...`);
        return fetch('https://www.netflix.com/browse')
            .then((response) => {
                // When the page is loaded convert it to text
                // console.log('Page loaded');
                return response.text()
            })
            .then(async (html) => {
                // console.log('Getting DOM...');
                // Initialize the DOM parser
                let parser = new DOMParser();

                // Parse the text
                let doc = parser.parseFromString(html, "text/html");

                // scroll to bottom
                console.log(`Infinite Scroll...`);
                this.infiniteScroll(doc);
                await this.parseSuggestMovies(doc)
            })
            .catch((error) => {
                console.error('Failed to fetch suggested movies', error)
            })
    }

    parseSuggestMovies(dom) {
        console.log('Parsing suggested movies...');

        let items = dom.getElementsByClassName('slider-item');

        // console.log('Looping through viewing history...');
        for (let item of items) {
            if (!(item.getElementsByTagName('a').length && item.getElementsByTagName('img').length)) continue;
            let anchor = item.getElementsByTagName('a')[0].getAttribute('href');
            let id = anchor.substring(
                anchor.lastIndexOf("/") + 1,
                anchor.lastIndexOf("?")
            );

            let img = item.getElementsByTagName('img')[0].getAttribute('src');
            let index = this.makeid()
            this.suggestedMovies[index] = {
                id: id,
                title: item.textContent,
                url: `${BASE_URL}/title/${id}`,
                type: item.textContent.indexOf('Season') !== -1 ? 'show' : 'movie',
                banner: img,
            };
            this.searchMovie(this.suggestedMovies[index].title).then(async (movieId) => {
                if (!movieId) return null;
                await this.fetchMovie(movieId).then((meta) => {
                    this.suggestedMovies[index].meta = meta
                });
                await this.fetchMovieCast(movieId).then((cast) => {
                    this.suggestedMovies[index].casts = cast
                });
            }).then(() => {
                this.calculateMatch(index);
            });
        }
    }

    makeid(length = 10) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    enrichHTML(index) {
        let html = ` <a id="netflix-item-${this.suggestedMovies[index].id}" data-percentage="${parseInt(this.suggestedMovies[index].matches)}" target="_blank" rel="nofollow" href="${this.suggestedMovies[index].url}"><div class="col-xs-3">
            <figure>
                <img src="${this.suggestedMovies[index].banner}" alt="${this.suggestedMovies[index].title}">
                
                <figcaption>${this.suggestedMovies[index].title} (${this.suggestedMovies[index].type})</figcaption>
            </figure>
        </div></a>`;

        let contentArea = document.getElementById('netflix-content');
        contentArea.innerHTML += html;
    }

    infiniteScroll(dom) {
        //console.log('Infinite scroll...');
        for (let i = 1; i < 100; i += 1) {
            window.scrollTo(0, dom.body.scrollHeight);
        }
        return true;
    }

    replaceAll(str) {
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
        };
        Object.keys(codes).forEach((ascii) => {
            str = str.replace(new RegExp(this.escapeRegExp(ascii), 'g'), codes[ascii]);
        });

        return str;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    searchMovie(title) {
        if (this.isEmpty(title)) return;
        // console.log(`Searching ${type == SUGGESTED ? 'Suggested' : 'Viewing History'} Movie [${title}]`);
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${title}&language=en-US&page=1&include_adult=true`)
            .then(res => res.json())
            .then(response => {
                if (
                    response.results
                    && response.results[0]
                    && response.results[0].id
                ) {
                    return response.results[0].id
                }

                return null
            })
            .catch((err) => {
                console.log('Failed to search movie: ', err);
            });
    }

    fetchMovie(id) {
        // console.log(`Fetching ${type == SUGGESTED ? 'Suggested' : 'Viewing History'} Movie [${id} - ${netflix_id}]`);
        return fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`)
            .then(res => res.json())
            .then(response => {
                // console.log('FETCH RESPONSE:', JSON.stringify(response, null, 4))
                // When the page is loaded convert it to text
                return response;
            })
            .catch((err) => {
                console.log('Failed to fetch movie: ', err);
            });
    }

    fetchMovieCast(id) {
        //  console.log(`Fetching ${type == SUGGESTED ? 'Suggested' : 'Viewing History'} Movie Cast [${id} - ${netflix_id}]`);
        return fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`)
            .then(res => res.json())
            .then(response => {
                // console.log('FETCH RESPONSE:', JSON.stringify(response, null, 4))
                // When the page is loaded convert it to text

                return response.cast;

            })
            .catch((err) => {
                console.log('Failed to fetch movie cast: ', err);
            });
    }

    ordinal_suffix_of(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    calculateMatch(index) {
        if (!this.suggestedMovies[index] || !this.suggestedMovies[index].meta) return this.suggestedMovies[index];
        //  console.log(`Calculating match for`, this.suggestedMovies[key]);
        let matches = [];
        matches['genres'] = 0;
        matches['production_company'] = 0;
        matches['languages'] = 0;
        matches['year'] = 0;
        matches['casts'] = 0;

        let genres = this.suggestedMovies[index].meta.genres;
        let casts = this.suggestedMovies[index].casts;
        let production_companies = this.suggestedMovies[index].meta.production_companies;
        let languages = this.suggestedMovies[index].meta.spoken_languages;
        let year = new Date(this.suggestedMovies[index].meta.release_date).getFullYear();

        Object.keys(this.viewedMovies).forEach((k) => {
            if (!this.viewedMovies[k].meta) return;
            let gen = this.viewedMovies[k].meta.genres;
            let prod_comp = this.viewedMovies[k].meta.production_companies;
            let lang = this.viewedMovies[k].meta.spoken_languages;
            let c = this.viewedMovies[k].casts;

            // compare genres
            for (let i in gen) {
                if (genres.filter(s => s.id == gen[i].id).length) {
                    matches['genres']++;
                }
            }

            // compare product_companies
            for (let j in prod_comp) {
                if (production_companies.filter(s => s.id == prod_comp[j].id).length) {
                    matches['production_company']++;
                }
            }

            // compare release date
            if (new Date(this.viewedMovies[k].release_date).getFullYear() == year) {
                matches['year']++;
            }

            // compare casts
            for (let l in c) {
                if (casts.filter(s => s.id == c[l].id).length) {
                    matches['casts']++;
                }
            }

            // compare languages
            for (let m in lang) {
                if (languages.filter(s => s.iso_639_1 == lang[m].iso_639_1).length) {
                    matches['languages']++;
                }
            }
        });

        let totalMatches = this.getArraySum(matches)
        this.suggestedMovies[index].matches = totalMatches
        if (totalMatches >= 2) this.enrichHTML(index);
        return this.suggestedMovies[index];
    }

    getArraySum(a) {
        var total = 0;
        for (var i in a) {
            total += a[i];
        }
        return total;
    }
}
