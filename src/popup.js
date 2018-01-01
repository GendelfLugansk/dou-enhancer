/* global chrome */

/**
 * Pass in the objects to merge as arguments.
 * For a deep extend, set the first argument to `true`
 *
 * Alternative to $.extend
 *
 * @see https://stackoverflow.com/a/38777298/2948109
 */
const extend = function () {
  let extended = {};
  let deep = false;
  let i = 0;
  let length = arguments.length;

  if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
    deep = arguments[0];
    i++;
  }

  let merge = function (obj) {
    for (let prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // If deep merge and property is an object, merge properties
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for (; i < length; i++) {
    let obj = arguments[i];
    merge(obj);
  }
  return extended;
};

const mediaSizes = ['none', 'small', 'medium', 'max'];

const defaultConfig = {
  mediaPreviewSize: 'small'
};

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

if (document.readyState === "complete") {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}

