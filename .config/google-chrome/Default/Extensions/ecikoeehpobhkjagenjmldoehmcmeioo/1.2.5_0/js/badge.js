
import browser from "webextension-polyfill";

export function render (text, color, title) {
    browser.browserAction.setBadgeText({ text });
    browser.browserAction.setBadgeBackgroundColor({ color });
    browser.browserAction.setTitle({ title });
}

export async function setIcon (status) {
    if(process.env.WHITELABEL_TOKEN != "vigiadepreco") status = "logo";
    if (!status) status = "logo";
    let path = `img/logos/48x48_${status}.png`;
    await browser.browserAction.setIcon({ path });
}

export function setTitle (title) {
    if (typeof title == "string" && title)
        browser.browserAction.setTitle({ title });
}

export const colors = new Map([
    ["default", [3, 102, 214, 255]],
    ["error", [203, 36, 49, 255]],
    ["warning", [245, 159, 0, 255]]
]);

export function getBadgeDefaultColor () {
    return colors.get("default");
}

export function getBadgeErrorColor () {
    return colors.get("error");
}

export function getBadgeWarningColor () {
    return colors.get("warning");
}