/* global chrome */
import mediaSizes from "./config/media-sizes";
import extend from './utils/extend';
import defaultConfig from './config/extension-defaults';

const fn = function () {
  /**
   * First we should get config
   */
  chrome.storage.sync.get(function (config) {
    config = extend(defaultConfig, config);
    chrome.storage.sync.set(config);

    const select = document.getElementById("mediaPreviewSize");
    mediaSizes.forEach(size => {
      let option = document.createElement("option");
      if (config.mediaPreviewSize === size) {
        option.setAttribute("selected", "selected");
      }
      option.value = size;
      option.textContent = size;
      select.appendChild(option);
    });
    select.onchange = function (e) {
      config.mediaPreviewSize = e.target.value;
      chrome.storage.sync.set(config);
      chrome.tabs.query({url: 'https://dou.ua/*'}, function (tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {action: 'update-config'});
        });
      });
    }
  });
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}

