export function getCurrentTab () {
    return new Promise((resolve) => {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, ([tab]) => {
            if (!tab) tab = {};
            if (!tab.url) tab.url = "";
            resolve(tab);
        });
    });
}
export function openNewTab (url) {
    chrome.tabs.create({
        url,
        active: true
    });
} 