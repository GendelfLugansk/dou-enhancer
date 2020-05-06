import profiler from '../utils/profiler';

/* global hljs, chrome */
hljs.configure({
  tabReplace: '  ',
});

const loadTheme = theme => {
  const linkId = 'dou-enhancer-hljs-stylesheet';
  const oldLink = document.getElementById(linkId);
  if (oldLink) {
    oldLink.remove();
  }
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.id = linkId;
  head.appendChild(link);
  link.href = chrome.runtime.getURL('vendor/highlightjs/styles/' + theme + '.css');
}

/**
 * This function highlights all code on page that is wrapped in correct tags
 */
const highlightCode = function ({hljsTheme = 'agate'} = {}) {
  profiler.start('highlightCode');
  loadTheme(hljsTheme);
  const processedMark = 'dou-enhancer-processed';
  const codeBlocks = document.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    if (!block.classList.contains(processedMark)) {
      block.classList.add(processedMark);
      const parent = block.parentElement;
      parent.classList.forEach(parentClass => {
        if (parentClass.indexOf('language-') !== -1) {
          block.classList.add(parentClass);
          parent.classList.remove(parentClass);
        }
      });
      parent.classList.add('hljs-code-container');
      hljs.highlightBlock(block);
    }
  });
  profiler.stop('highlightCode');
};

export default highlightCode;
