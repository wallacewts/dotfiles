
import browser from "webextension-polyfill";

export function showNotificationOnBrowser ({ notification, click }) {
    if (getBrowser() == "firefox") delete notification.buttons;

    const key = "vigiadepreco-notificition-" + new Date().getTime();
    browser.notifications.create(key, notification);

    chrome.notifications.onButtonClicked.addListener(click);
}

function getBrowser () {

    if (typeof chrome !== "undefined") {
        if (typeof browser !== "undefined") {
            return "firefox";
        } else {
            return "chrome";
        }
    } else {
        return "edge";
    }
}