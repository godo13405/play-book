'use strict';


const internal = {
    data: async () => {
        return {
            plays: await fetch('../data/plays.json')
                .then(resp => resp.json())
                .then((data) => {
                    return data;
                }),
            stages: await fetch('../data/stages.json')
                .then(resp => resp.json())
                .then((data) => {
                    return data;
                })
        };
    },
    fetch: async (url, type = 'json') => {
        return await fetch(url)
            .then(resp => {
                switch (type) {
                    case ('html'):
                        return resp.text();
                    default:
                        return resp.json();
                }
            })
            .then((data) => {
                return data;
            })
    },
    delay: (() => {
        var timer = 0;
        return (callback, ms = 400) => {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })(),
    hashChange: (e, hash = window.location.hash.slice(1)) => {
        if (hash && hash.length) {
            document.querySelector(".modal-container .modal").innerHTML = template.playSimple;
            document.querySelector(".modal-container").classList.add("active");
        } else {
            document.querySelector(".modal-container").classList.remove("active");
        }
    }
};

const func = {
    init: () => {
        let output = "";
        const load = {
            play: internal.fetch('../templates/play.html', 'html'),
            playSimple: internal.fetch('../templates/play-simple.html', 'html'),
        };
        Promise.all([load.play, load.playSimple]).then(input => {
            const template = input[1];
            window.template = {
                play: input[0],
                playSimple: input[1]
            };
            data.plays.forEach(x => {
                output += func.playCard({
                    data: x,
                    template,
                    templateName: 'playSimple'
                }).outerHTML;
            });
            document.querySelector(".list").innerHTML = output;

            window.onhashchange = internal.hashChange;
        });
    },
    search: (q, searchIn) => {
        internal.delay(() => {
            q = q.toLowerCase();
            const output = data.plays.filter(x => {
                // does it match id?
                if ((!searchIn || searchIn === 'id') && x.id === q) {
                    return true;
                }

                // does it match text?
                for (const k in x.content) {
                    if ((!searchIn || searchIn === k) && x.content[k].toLowerCase().includes(q)) {
                        return true;
                    }
                }

                // does it match stage?
                // let stag = {};
                for (const k in data.stages) {
                    data.stages[k].forEach(y => {
                        if ((!searchIn || searchIn === k) && y.toLowerCase().includes(q)) {
                            return true;
                        }
                    });
                }

                return false;
            });

            let temp = document.createElement('div');
            output.forEach(x => {
                temp.appendChild(func.playCard({
                    data: x
                }));
            });

            document.querySelector(".list").innerHTML = temp.innerHTML;
        });
    },
    playCard: ({
        data,
        template = window.template.playSimple,
        templateName = 'play'
    }) => {
        const id = data.id.replace(/\./, '');
        let output = document.createElement('li');
        output.setAttribute("id", id);
        output.setAttribute("onclick", `window.location.hash = ${id}`);
        output.classList.add('list-item', templateName);
        output.innerHTML = template;

        if (data.stages) {
            // highlight competency stages
            data.stages.competence.forEach(x => {
                if (output.querySelector(`.competence .step-${x}`)) {
                    output.querySelector(`.competence .step-${x}`).classList.add('active');
                }
            });

            // highlight literacy stages
            for (let i = 0; i <= data.stages.literacy; i++) {
                if (output.querySelector(`.literacy .step-${i}`)) {
                    output.querySelector(`.literacy .step-${i}`).classList.add('active');
                }
            }

            // highlight team stages
            for (let i = 5; i >= data.stages.team; i--) {
                if (output.querySelector(`.team .step-${i}`)) {
                    output.querySelector(`.team .step-${i}`).classList.add('active');
                }
            }
        }

        // populate text
        for (const k in data.content) {
            if (output.querySelector(`.content .${k}`)) {
                output.querySelector(`.${k}`).innerHTML = data.content[k];
            }
        };

        // populate ID
        if (output.querySelector(`.id`)) {
            output.querySelector(`.id`).innerHTML = data.id;
        }

        return output;

    }
};

window.func = func;

(() => {
    internal.data().then((e) => {
        window.data = e;
        func.init();
    });
})();