'use strict';


class VideoService {
    exists(ids) {
        return fetch(this.base + 'videos/exist/' + ids.join(','));
    }
    add(id){
        console.log("Adding video with ID", id);
    }
    constructor(base) {
        this.base = base;
    }
}


function init() {
    var videoService = new VideoService('https://localhost:8084/api/');

    function getNewVideoIds(ids) {
        return new Promise(function (resolve, reject) {
            videoService.exists(ids).then((response) => {
                response.json().then((existingIds) => {
                    var existingIdsMap = existingIds.reduce((result, id)=> {
                        result[id] = true;
                        return result;
                    }, {});

                    resolve(ids.reduce((result, id)=> {
                        if(!(id in existingIdsMap)){
                            cache[id] = false;
                            result[id] = cache[id];
                        } else {
                            cache[id] = true;
                        }
                        return result;
                    }, {}));
                });
            }, (error) => {
                debugger
            });
        });
    }

    var cache = {};
    var inProcessing = {};

    function fetchAdded(ids) {
        var newIds = ids.filter(id => !(id in cache)).filter(id => !(id in inProcessing));
        newIds.forEach((id)=> {
            inProcessing[id] = true
        });

        if (newIds.length) {
            return getNewVideoIds(ids);
        }
        return new Promise((resolve)=> {
            resolve({empty: true});
        });
    }

    function extractId(node) {
        return node.getAttribute('data-vid') || node.getAttribute('data-context-item-id');
    }

    var className = 'tango-videos-container';

    function newAddButton(id){
        var span = document.createElement("span");
        span.innerHTML = 'AT+';
        span.style.position = 'absolute';
        span.style.left = '0';
        span.style.top = '0';
        span.style.background = '#fff';
        span.onclick = function () {
            videoService.add(id);
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
        };
        return span;
    }

    function checkImages() {

        var containers = Array.prototype.slice.call(document.querySelectorAll('.yt-uix-simple-thumb-wrap[data-vid],.yt-lockup-video[data-context-item-id]'));
        fetchAdded(containers.map(extractId))
            .then((result) => {
                var newContainers = containers.filter(container => !container.classList.contains(className));
                newContainers.map(function (container) {
                    var id = extractId(container);
                    if(result[id] === false){
                        container.appendChild(newAddButton(id))
                        container.style.position = 'relative';

                    }
                });
            });


    }

    window.setInterval(checkImages, 1000);
}

init();
