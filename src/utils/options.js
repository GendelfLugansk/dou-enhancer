/* global chrome */
import mediaSizes from "../config/media-sizes";
import hljsThemes from "../config/hljs-themes"
import Alerts from './alerts';
import debounce from "./debounce";
import defaultConfig from "../config/extension-defaults";
import extend from "./extend";

const Options = function () {
  this.alerts = new Alerts('#configAlerts');
  chrome.storage.sync.get(config => {
    config = extend({}, defaultConfig, config);

    this.setup(config);
  });
};

Options.prototype.updateLSCounter = function () {
  const localStorageCounter = document.getElementById('localStorageCounter');
  chrome.storage.local.getBytesInUse((bytesInUse) => {
    if (chrome.runtime.lastError) {
      this.alerts.failure('Can not get used bytes: ' + chrome.runtime.lastError.message);
      return;
    }

    localStorageCounter.innerText = `${bytesInUse} / 5242880 bytes`;
  });
};

Options.prototype.updateSSCounter = function () {
  const syncStorageCounter = document.getElementById('syncStorageCounter');
  chrome.storage.sync.getBytesInUse((bytesInUse) => {
    if (chrome.runtime.lastError) {
      this.alerts.failure('Can not get used bytes: ' + chrome.runtime.lastError.message);
      return;
    }

    syncStorageCounter.innerText = `${bytesInUse} / 102400 bytes`;
  });
};

Options.prototype.toggleDisabledPreviewSettings = function (config) {
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

Options.prototype.saveChanges = debounce(function (config) {
  chrome.storage.sync.set(config, () => {
    if (chrome.runtime.lastError) {
      this.alerts.failure('Can not store settings in synced storage: ' + chrome.runtime.lastError.message);
    } else {
      this.alerts.success('Saved!');
      this.updateSSCounter();
    }
  });
}, 500);

Options.prototype.setup = function (config) {
  const that = this;

  const mediaPreviewCheckbox = document.getElementById("mediaPreview");
  mediaPreviewCheckbox.checked = config.mediaPreview;
  mediaPreviewCheckbox.onchange = function () {
    config.mediaPreview = this.checked;
    that.toggleDisabledPreviewSettings(config);
    that.saveChanges(config);
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
    that.saveChanges(config);
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
    that.saveChanges(config);
  };

  this.toggleDisabledPreviewSettings(config);

  const expandThreadsCheckbox = document.getElementById("expandThreads");
  expandThreadsCheckbox.checked = config.expandThreads;
  expandThreadsCheckbox.onchange = function () {
    config.expandThreads = this.checked;
    that.saveChanges(config);
  };

  const twemojiCheckbox = document.getElementById("twemoji");
  twemojiCheckbox.checked = config.twemoji;
  twemojiCheckbox.onchange = function () {
    config.twemoji = this.checked;
    that.saveChanges(config);
  };

  const hljsThemeSelect = document.getElementById("hljsTheme");
  hljsThemes.forEach(theme => {
    let option = document.createElement("option");
    if (config.hljsTheme === theme) {
      option.setAttribute("selected", "selected");
    }
    option.value = theme;
    option.textContent = theme;
    hljsThemeSelect.appendChild(option);
  });
  hljsThemeSelect.onchange = function (e) {
    config.hljsTheme = e.target.value;
    that.saveChanges(config);
  };

  const devOptsExpander = document.getElementById('devOptionsExpander');
  devOptsExpander.onclick = function () {
    devOptsExpander.classList.toggle('expanded');
    const devOpts = document.getElementById('devOptions');
    const display = devOptsExpander.classList.contains('expanded') ? 'block' : 'none';
    devOpts.querySelectorAll('div').forEach(item => {
      item.style.display = display;
    });
  };
  devOptsExpander.onclick();

  const profilerCheckbox = document.getElementById("profiler");
  profilerCheckbox.checked = config.profiler;
  profilerCheckbox.onchange = function () {
    config.profiler = this.checked;
    if (this.checked) {
      that.alerts.warning('You enabled profiler. This could impact site performance. Disable profiler if you enabled it by mistake.', {
        timeout: 10000
      })
    }
    that.saveChanges(config);
  };

  this.updateLSCounter();
  this.updateSSCounter();

  const clearLocalStorageButton = document.getElementById("clearLocalStorage");
  clearLocalStorageButton.onclick = function () {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        that.alerts.failure('Can not clear storage: ' + chrome.runtime.lastError.message);
      } else {
        that.alerts.success('Cleared');
        that.updateLSCounter();
      }
    });
  };

  const clearSyncStorageButton = document.getElementById("clearSyncStorage");
  clearSyncStorageButton.onclick = function () {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) {
        that.alerts.failure('Can not clear storage: ' + chrome.runtime.lastError.message);
      } else {
        that.alerts.success('Cleared, reload popup or options page!');
        that.updateSSCounter();
      }
    });
  };

  const dumpLocalStorageButton = document.getElementById("dumpLocalStorage");
  dumpLocalStorageButton.onclick = function () {
    chrome.windows.create({
      url: 'profiling.html'
    });
  };

  document.querySelectorAll("form").forEach(form => {
    form.onsubmit = () => {
      return false;
    };
  })
};

export default Options;
