/* global chrome */
import mediaSizes from "./config/media-sizes";
import extend from './utils/extend';
import defaultConfig from './config/extension-defaults';
import Alerts from './utils/alerts';
import debounce from "./utils/debounce";

const fn = function () {
  const alerts = new Alerts('#configAlerts');

  const updateLSCounter = function () {
    const localStorageCounter = document.getElementById('localStorageCounter');
    chrome.storage.local.getBytesInUse((bytesInUse) => {
      if (chrome.runtime.lastError) {
        alerts.failure('Can not get used bytes: ' + chrome.runtime.lastError.message);
        return;
      }

      localStorageCounter.innerText = `${bytesInUse} / 5242880 bytes`;
    });
  };

  const updateSSCounter = function () {
    const syncStorageCounter = document.getElementById('syncStorageCounter');
    chrome.storage.sync.getBytesInUse((bytesInUse) => {
      if (chrome.runtime.lastError) {
        alerts.failure('Can not get used bytes: ' + chrome.runtime.lastError.message);
        return;
      }

      syncStorageCounter.innerText = `${bytesInUse} / 102400 bytes`;
    });
  };

  const toggleDisabledPreviewSettings = function (config) {
    const previewSizeSelect = document.getElementById("mediaPreviewSize");
    const mediaGridColumnsSelect = document.getElementById("mediaGridColumns");
    if (!config.mediaPreview) {
      previewSizeSelect.setAttribute("disabled", "disabled");
      mediaGridColumnsSelect.setAttribute("disabled", "disabled");
    } else {
      previewSizeSelect.removeAttribute("disabled");
      mediaGridColumnsSelect.removeAttribute("disabled");
    }

  };

  const saveChanges = debounce(function (config) {
    chrome.storage.sync.set(config, () => {
      if (chrome.runtime.lastError) {
        alerts.failure('Can not store settings in synced storage: ' + chrome.runtime.lastError.message);
      } else {
        alerts.success('Saved!');
        updateSSCounter();
      }
    });
  }, 500);

  /**
   * First we should get config
   */
  chrome.storage.sync.get(function (config) {
    config = extend({}, defaultConfig, config);

    const mediaPreviewCheckbox = document.getElementById("mediaPreview");
    mediaPreviewCheckbox.checked = config.mediaPreview;
    mediaPreviewCheckbox.onchange = function () {
      config.mediaPreview = this.checked;
      toggleDisabledPreviewSettings(config);
      saveChanges(config);
    };

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

    const mediaGridColumnsSelect = document.getElementById("mediaGridColumns");
    [2, 3, 4].forEach(size => {
      let option = document.createElement("option");
      if (String(config.mediaGridColumns) === String(size)) {
        option.setAttribute("selected", "selected");
      }
      option.value = size;
      option.textContent = size;
      mediaGridColumnsSelect.appendChild(option);
    });
    mediaGridColumnsSelect.onchange = function (e) {
      config.mediaGridColumns = Number(e.target.value);
      saveChanges(config);
    };

    toggleDisabledPreviewSettings(config);

    const expandThreadsCheckbox = document.getElementById("expandThreads");
    expandThreadsCheckbox.checked = config.expandThreads;
    expandThreadsCheckbox.onchange = function () {
      config.expandThreads = this.checked;
      saveChanges(config);
    };

    const devOptsExpander = document.getElementById('devOptionsExpander');
    devOptsExpander.onclick = function () {
      devOptsExpander.classList.toggle('expanded');
      const devOpts = document.getElementById('devOptions');
      devOpts.classList.toggle('hidden')
    };

    const profilerCheckbox = document.getElementById("profiler");
    profilerCheckbox.checked = config.profiler;
    profilerCheckbox.onchange = function () {
      config.profiler = this.checked;
      if (this.checked) {
        alerts.warning('You enabled profiler. This could impact site performance. Disable profiler if you enabled it by mistake.', {
          timeout: 10000
        })
      }
      saveChanges(config);
    };

    updateLSCounter();
    updateSSCounter();

    const clearLocalStorageButton = document.getElementById("clearLocalStorage");
    clearLocalStorageButton.onclick = function () {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          alerts.failure('Can not clear storage: ' + chrome.runtime.lastError.message);
        } else {
          alerts.success('Cleared');
          updateLSCounter();
        }
      });
    };

    const clearSyncStorageButton = document.getElementById("clearSyncStorage");
    clearSyncStorageButton.onclick = function () {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          alerts.failure('Can not clear storage: ' + chrome.runtime.lastError.message);
        } else {
          alerts.success('Cleared');
          updateSSCounter();
        }
      });
    };

    const dumpLocalStorageButton = document.getElementById("dumpLocalStorage");
    dumpLocalStorageButton.onclick = function () {
      chrome.windows.create({
        url: 'profiling.html'
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

