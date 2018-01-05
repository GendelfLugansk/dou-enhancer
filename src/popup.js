/* global chrome */
import mediaSizes from "./config/media-sizes";
import extend from './utils/extend';
import defaultConfig from './config/extension-defaults';
import Alerts from './utils/alerts';
import debounce from "./utils/debounce";

const fn = function () {
  const alerts = new Alerts('#configAlerts');

  const saveChanges = debounce(function (config) {
    chrome.storage.sync.set(config, () => {
      if (chrome.runtime.lastError) {
        alerts.failure('Can not store settings in synced storage: ' + chrome.runtime.lastError.message);
      } else {
        alerts.success('Saved!');
      }
    });
  }, 500);

  /**
   * First we should get config
   */
  chrome.storage.sync.get(function (config) {
    config = extend({}, defaultConfig, config);

    const previewSizeSelect = document.getElementById("mediaPreviewSize");
    mediaSizes.forEach(size => {
      let option = document.createElement("option");
      if (config.mediaPreviewSize === size) {
        option.setAttribute("selected", "selected");
      }
      option.value = size;
      option.textContent = size;
      previewSizeSelect.appendChild(option);
    });
    previewSizeSelect.onchange = function (e) {
      config.mediaPreviewSize = e.target.value;
      saveChanges(config);
    };

    const profilerCheckbox = document.getElementById("profiler");
    profilerCheckbox.checked = config.profiler;
    profilerCheckbox.onchange = function () {
      config.profiler = this.checked;
      if (this.checked) {
        alerts.warning('You enabled profiler. This could impact site perfomance. Disable profiler if you enabled it by mistake.', {
          timeout: 10000
        })
      }
      saveChanges(config);
    };

    const clearLocalStorageButton = document.getElementById("clearLocalStorage");
    const storageCounter = clearLocalStorageButton.querySelector('span');
    if (storageCounter) {
      chrome.storage.local.getBytesInUse((bytesInUse) => {
        if (chrome.runtime.lastError) {
          alerts.failure('Can not get used bytes: ' + chrome.runtime.lastError.message);
          return;
        }

        if (bytesInUse > 0) {
          storageCounter.innerText = `(${bytesInUse} / 5242880 bytes)`;
        }
      });
    }
    clearLocalStorageButton.onclick = function () {
      chrome.storage.local.clear(() =>{
        if (chrome.runtime.lastError) {
          alerts.failure('Can not store clear: ' + chrome.runtime.lastError.message);
        } else {
          alerts.success('Cleared');
          if (storageCounter) {
            storageCounter.innerText = '';
          }
        }
      });
    };

    const dumpLocalStorageButton = document.getElementById("dumpLocalStorage");
    dumpLocalStorageButton.onclick = function () {
      chrome.storage.local.get('profilerStats', (stats) => {
        if (chrome.runtime.lastError) {
          alerts.failure('Can not get data: ' + chrome.runtime.lastError.message);
          return;
        }

        /* global hljs */
        hljs.configure({
          tabReplace: '  ',
        });

        const statsContainer = document.getElementById("profilerStats");
        let pre = statsContainer.querySelector('pre');
        if (pre) {
          pre.remove();
        }
        pre = document.createElement("pre");
        const code = document.createElement("code");
        code.classList.add('language-json');
        code.innerText = JSON.stringify(stats.profilerStats, null, 2);
        pre.appendChild(code);
        statsContainer.appendChild(pre);
        hljs.highlightBlock(code);
      });
    };
  });
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}

