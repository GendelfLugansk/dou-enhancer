import stripTags from '../../node_modules/striptags/src/striptags.js'

/**
 * This function adds event listeners for copy event and prepares preprocessor for tinyMCE
 */
const createPreprocessor = function () {
  let copied;

  document.querySelectorAll('.l-content-wrap .b-typo').forEach(element => {
    element.addEventListener('copy', () => {
      copied = String(window.getSelection());
    });
  });

  return function (plugin, args) {
    if (stripTags(copied).replace(/[\s\n\r]+/gi, '') === stripTags(args.content).replace(/[\s\n\r]+/gi, '')) {
      args.content = `<blockquote>${args.content}</blockquote><p></p>`;
    }
    args.content += ' ';
  }
};

export default createPreprocessor;
