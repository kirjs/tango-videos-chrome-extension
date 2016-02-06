'use strict';


window.onload = function init() {
    window.console.log('hello');


    function getVideosStatuses(ids) {
        return new Promise(function (resolve, reject) {

            ids.forEach(function () {
                cache.id = true;
            });


            resolve(ids.reduce((result, id)=> {
                result[id] = cache[id];
                return result;
            }, {}));

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
            return getVideosStatuses(ids);
        }
        return new Promise((resolve)=> {
            resolve({empty: true});
        });
    }

    function extractId(node) {
        return node.getAttribute('data-vid') || node.getAttribute('data-context-item-id');
    }

    var className = 'tango-videos-container';
    function checkImages() {

        var containers = Array.prototype.slice.call(document.querySelectorAll('.yt-uix-simple-thumb-wrap[data-vid],.yt-lockup-video[data-context-item-id]'));
        fetchAdded(containers.map(extractId))
            .then((result) => {
                var newContainers = containers.filter(container => !container.classList.contains(className));
                newContainers.map(function (span) {
                    var id = extractId(span);
                    span.classList.add(className);
                });
            });


    }

    window.setInterval(checkImages, 1000);
};
