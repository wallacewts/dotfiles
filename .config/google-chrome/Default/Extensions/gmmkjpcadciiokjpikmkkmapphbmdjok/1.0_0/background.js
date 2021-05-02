'use strict';

chrome.runtime.onMessageExternal.addListener(
    function (req, sender, sendResponse) {
        if (req.cmd === 'rbGetVersion') {
            sendResponse({ver: "1.0"});
        } else if (req.cmd === 'rbPostData') {
            fetchRequest(req.data, sendResponse);
        }

        return true;
    }
);