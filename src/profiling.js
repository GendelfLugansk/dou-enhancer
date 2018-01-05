import Alerts from './utils/alerts';

const fn = function () {
  const alerts = new Alerts('#alerts');
  /* global chrome */
  chrome.storage.local.get('profilerStats', (stats) => {
    if (chrome.runtime.lastError) {
      alerts.failure('Can not get data: ' + chrome.runtime.lastError.message);
      return;
    }

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
    /* global hljs */
    hljs.configure({
      tabReplace: '  ',
    });
    hljs.highlightBlock(code);
  });
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}
