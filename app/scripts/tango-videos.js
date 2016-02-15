'use strict';


class VideoService {
    exists(ids) {
        return fetch(this.base + 'videos/exist/' + ids.join(','));
    }
    add(id){
        return fetch(this.base + 'videos/add', {
            method: 'post',
            body: JSON.stringify({id: id}),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }
    constructor(base) {
        this.base = base;
    }
}


function init() {
    var videoService = new VideoService('https://localhost:8084/api/');

    function getNewVideoIds(ids) {
        return new Promise(function (resolve) {
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
            }, () => {
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
        span.classList.add('tango-videos-container');
        span.innerHTML = 'AT+';
        span.onclick = function () {
            span.innerHTML = '...';
            videoService.add(id).then(()=>{
                span.innerHTML = 'Added';
                span.style.display = 'none';
            }, () => {
                span.innerHTML = 'Error';
            });
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
                        container.appendChild(newAddButton(id));
                        container.style.position = 'relative';

                    }
                });
            });


    }

    window.setInterval(checkImages, 1000);
}

init();
