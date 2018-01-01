/* global chrome */
const rule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'dou.ua', schemes: ['https', 'http']}
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([rule]);
    });
});