const PORT_MESSAGE = chrome.runtime.connect({ name: "vigiadeprecoextension" });

export function setPostMassage (message) {
    PORT_MESSAGE.postMessage(message);
}

export function sendEvent ({ action, type, view, payload = {}, module, storeid }) {
    return setPostMassage({
        payload: {
            type,
            referrer_url: window.location.href,
            view,
            action,
            module,
            storeid,
            ...payload
        },
        type: "events"
    });
}