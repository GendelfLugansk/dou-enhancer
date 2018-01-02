/* global hljs */
hljs.configure({
  tabReplace: '  ',
});
const highlightCode = function () {
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
};

export default highlightCode;
