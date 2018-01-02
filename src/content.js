/* global tinymce, chrome */

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @see https://davidwalsh.name/javascript-debounce-function
 */
const debounce = function (func, wait, immediate) {
  let timeout;
  return function () {
    let context = this, args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

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

/**
 * Sends data to script that injected in page (to bypass context limitations)
 * Look for `otherSideFunc` in code below to understand how it works
 *
 * @param details
 */
const frontToBack = function (details) {
  let event = new CustomEvent("frontToBack", {
    detail: details
  });
  window.dispatchEvent(event);
};

/**
 * Default TinyMCE config according to tags acceptable by dou
 */
const defaultMCEConfig = {
  menu: {
    edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
    format: {
      title: 'Format',
      items: 'bold italic strikethrough | removeformat'
    }
  },
  menubar: false,
  toolbar: 'code | undo redo | cut copy paste pastetext | template | searchreplace | styleselect | bold italic strikethrough removeformat | blockquote codesample | bullist numlist',
  plugins: 'lists code codesample paste autolink searchreplace template',
  style_formats: [
    {
      title: 'Inline',
      items: [
        {title: 'Bold', icon: 'bold', format: 'bold'},
        {title: 'Italic', icon: 'italic', format: 'italic'},
        {title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
      ]
    },

    {
      title: 'Blocks',
      items: [
        {title: 'Quote', format: 'blockquote'},
        {title: 'Pre', format: 'pre'},
        {title: 'Code', format: 'code'},
      ]
    }
  ],
  block_formats: (
    'Paragraph=p;' +
    'Heading 1=h1;' +
    'Heading 2=h2;' +
    'Heading 3=h3;' +
    'Heading 4=h4;' +
    'Heading 5=h5;' +
    'Heading 6=h6;'
  ),
  formats: {
    alignleft: {selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-align-left'},
    aligncenter: {
      selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
      classes: 'text-align-center'
    },
    alignright: {selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-align-right'},
    alignjustify: {
      selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
      classes: 'text-align-justify'
    },
    bold: {inline: 'b'},
    italic: {inline: 'i'},
    underline: {inline: 'u'},
    strikethrough: {inline: 'del'},
  },
  custom_undo_redo_levels: 10,
  content_css: chrome.runtime.getURL("css/tinymce-content.css"),
  paste_as_text: true,
  paste_preprocess: function (plugin, args) {
    args.content += ' ';
  },
  codesample_languages: [
    {text: 'None', value: 'none'},
    {text: '1C', value: '1c'},
    {text: 'Apache', value: 'apache'},
    {text: 'AppleScript', value: 'applescript'},
    {text: 'Bash', value: 'bash'},
    {text: 'Basic', value: 'basic'},
    {text: 'C#', value: 'csharp'},
    {text: 'C++', value: 'cpp'},
    {text: 'CSS', value: 'css'},
    {text: 'Clojure', value: 'clojure'},
    {text: 'CoffeeScript', value: 'coffeescript'},
    {text: 'Diff', value: 'diff'},
    {text: 'HTML/XML', value: 'xhtml'},
    {text: 'HTTP', value: 'http'},
    {text: 'Ini', value: 'ini'},
    {text: 'JSON', value: 'json'},
    {text: 'Java', value: 'java'},
    {text: 'JavaScript', value: 'javascript'},
    {text: 'Less', value: 'less'},
    {text: 'PHP', value: 'php'},
    {text: 'Python', value: 'python'},
    {text: 'Ruby', value: 'ruby'},
    {text: 'SCSS', value: 'scss'},
  ],
  templates: [
    {title: 'Не читал, осуждаю', description: 'Не читал, осуждаю', content: 'Не читал, но осуждаю'},
    {title: 'Читал, осуждаю', description: 'Читал, осуждаю', content: 'Читал, но всё равно осуждаю'},
  ],
};

const mediaSizes = ['none', 'small', 'medium', 'max'];

const defaultConfig = {
  mediaPreviewSize: 'small'
};

const addImagePreviews = function (mediaPreviewSize) {
  mediaSizes.forEach(size => {
    document.body.classList.remove('dou-enhancer-media-size-' + size);
  });
  document.body.classList.add('dou-enhancer-media-size-' + mediaPreviewSize);

  if (mediaPreviewSize === 'none') {
    return;
  }

  const links = document.querySelectorAll('#commentsList .comment .text a');
  links.forEach((link) => {
    const processedMark = 'dou-enhancer-processed';
    if (!link.classList.contains(processedMark)) {
      link.classList.add(processedMark);
      let src = link.href;
      if (src.search(/\.(png|jpg|gif|jpeg|bmp|tiff)$/gi) !== -1) {
        let img = document.createElement("img");
        img.src = src;

        let div = document.createElement("div");
        div.classList.add('dou-enhancer-image-preview');
        div.appendChild(img);

        link.parentElement.appendChild(div);
      } else {
        const ytRe = /^((https|http):\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?(.+)/gi;
        if (src.search(ytRe) !== -1) {
          const matches = ytRe.exec(src);
          let frame = document.createElement("iframe");
          frame.src = "https://www.youtube.com/embed/" + matches[6];
          frame.setAttribute('allow', "encrypted-media");
          frame.setAttribute('gesture', "media");
          frame.setAttribute('frameborder', "0");
          frame.setAttribute('allowfullscreen', '');

          let div = document.createElement("div");
          div.classList.add('dou-enhancer-yt-preview');
          div.appendChild(frame);

          link.parentElement.appendChild(div);
        }
      }
    }
  });
};

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

/**
 * Main function which initializes editor
 */
const fn = function () {
  /**
   * First we should get config
   */
  chrome.storage.sync.get(function (config) {
    config = extend(defaultConfig, config);
    chrome.storage.sync.set(config);

    /**
     * This code allows to bypass context limitations
     *
     * @see https://stackoverflow.com/a/21784877/2948109
     */
    const otherSideFunc = function () {
      /**
       * Sends data to content script
       *
       * @param details
       */
      const backToFront = function (details) {
        let event = new CustomEvent("backToFront", {
          detail: details
        });
        window.dispatchEvent(event);
      };

      if (!window.commentsManager && window.CommentsManager) {
        window.commentsManager = new window.CommentsManager();
      }

      if (window.commentsManager) {
        /**
         * Listen for messages from content script
         */
        window.addEventListener("frontToBack", function (e) {
          if (e.detail) {
            switch (e.detail.target) {
              case 'defaultForm':
                switch (e.detail.evt) {
                  case 'focus':
                    /**
                     * Editor focused
                     */
                    try {
                      window.commentsManager.defaultForm.onFocus();
                    } catch (e) {
                      throw new Error("Extension is broken due to some external changes" + String(e));
                    }
                    break;

                  case 'blur':
                    /**
                     * Editor blurred
                     */
                    try {
                      window.commentsManager.defaultForm.onBlur();
                    } catch (e) {
                      throw new Error("Extension is broken due to some external changes" + String(e));
                    }
                    break;

                  case 'enter':
                    /**
                     * Ctrl+Enter
                     */
                    try {
                      window.commentsManager.defaultForm._onSubmit();
                    } catch (e) {
                      throw new Error("Extension is broken due to some external changes" + String(e));
                    }
                    break;
                }
                break;

              case 'floatForm':
                switch (e.detail.evt) {
                  case 'focus':
                    /**
                     * Editor focused
                     */
                    try {
                      window.commentsManager.floatForm.floatForm.onFocus();
                    } catch (e) {
                      throw new Error("Extension is broken due to some external changes" + String(e));
                    }
                    break;

                  case 'blur':
                    /**
                     * Editor blurred
                     */
                    try {
                      window.commentsManager.floatForm.floatForm.onBlur();
                    } catch (e) {
                      throw new Error("Extension is broken due to some external changes" + String(e));
                    }
                    break;

                  case 'enter':
                    /**
                     * Ctrl+Enter
                     */
                    try {
                      window.commentsManager.floatForm.floatForm._onSubmit();
                    } catch (e) {
                      throw new Error("Extension is broken due to some external changes" + String(e));
                    }
                    break;
                }
                break;
            }
          }
        });

        /**
         * Hack into floatForm to detect when it's open and inform content-script
         */
        try {
          window.commentsManager.floatForm.insertFormOrig = window.commentsManager.floatForm.insertForm;
          window.commentsManager.floatForm.insertForm = function () {
            window.commentsManager.floatForm.insertFormOrig(...arguments);
            backToFront({
              target: 'floatForm',
              evt: 'insert'
            });
          };

          window.commentsManager.floatForm.insertEditFormOrig = window.commentsManager.floatForm.insertEditForm;
          window.commentsManager.floatForm.insertEditForm = function () {
            window.commentsManager.floatForm.insertEditFormOrig(...arguments);
            backToFront({
              target: 'floatForm',
              evt: 'insert-edit'
            });
          };

          window.commentsManager.floatForm.closeOrig = window.commentsManager.floatForm.close;
          window.commentsManager.floatForm.close = function () {
            window.commentsManager.floatForm.closeOrig(...arguments);
            backToFront({
              target: 'floatForm',
              evt: 'close'
            });
          };
        } catch (e) {
          throw new Error("Extension is broken due to some external changes" + String(e));
        }
      }
    };
    const scr = document.createElement('script');
    scr.textContent = '(' + otherSideFunc + ')();';
    (document.head || document.documentElement).appendChild(scr);
    scr.parentNode.removeChild(scr);

    /**
     * Base url for icons and stuff like that
     */
    tinymce.baseURL = chrome.runtime.getURL("vendor/tinymce");

    /**
     * Callbacks for comments mutation observer to detect comment's submission
     */
    let commentsMutationCallbacks = [];
    const targetNode = document.getElementById('commentsList');
    if (targetNode) {
      const mutationConfig = {subtree: true, childList: true};
      const callback = debounce(function () {
        const args = arguments;
        commentsMutationCallbacks.forEach(cb => {
          cb(...args);
        });
      }, 100);
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, mutationConfig);
    }

    const focusBeforeTemplate = function (editor) {
      editor.getContainer()
        .querySelector('.mce-panel button .mce-i-template')
        .parentElement
        .addEventListener('click', function () {
          editor.focus();
        });
    };

    /**
     * Config for first-level comment form
     */
    let defaultFormConfig = extend(true, {}, defaultMCEConfig, {
      selector: '#inlineForm textarea',
      init_instance_callback: function (editor) {
        commentsMutationCallbacks.push(function () {
          editor.load();
        });

        /**
         * On focus imitate original textarea focus event and update tinymce to fix placeholder
         */
        editor.on('Focus', function () {
          frontToBack({
            target: 'defaultForm',
            evt: 'focus'
          });
          setTimeout(() => {
            editor.load();
          }, 10);
        });

        /**
         * On blur imitate original blur event
         */
        editor.on('Blur', function () {
          frontToBack({
            target: 'defaultForm',
            evt: 'blur'
          });
          setTimeout(() => {
            editor.load();
          }, 10);
        });

        /**
         * On change and keyup update original textarea (tinymce does not do this)
         */
        const changeHandler = function () {
          const textarea = document.querySelector('#inlineForm textarea');
          if (textarea) {
            editor.save();
            let evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            textarea.dispatchEvent(evt);
          }
        };
        editor.on('Change', changeHandler);
        editor.on('keyup', changeHandler);
        editor.shortcuts.add("ctrl+13", "Submit!", function () {
          frontToBack({
            target: 'defaultForm',
            evt: 'enter'
          });
        });

        focusBeforeTemplate(editor);
      }
    });
    tinymce.init(defaultFormConfig);

    /**
     * Config for "floating" form (answers to comments)
     */
    let floatFormConfig = extend(true, {}, defaultMCEConfig, {
      selector: '#floatForm textarea',
      init_instance_callback: function (editor) {
        /**
         * Listen for messages from "other side"
         */
        window.addEventListener("backToFront", function (e) {
          if (e.detail) {
            switch (e.detail.target) {
              case 'floatForm':
                switch (e.detail.evt) {
                  case 'close':
                    /**
                     * Remove editor when user closes floating form
                     */
                    editor.remove();
                    break;
                }
                break;
            }
          }
        });

        editor.on('Focus', function () {
          frontToBack({
            target: 'floatForm',
            evt: 'focus'
          });
          setTimeout(() => {
            editor.load();
          }, 10);
        });

        editor.on('Blur', function () {
          frontToBack({
            target: 'floatForm',
            evt: 'blur'
          });
          setTimeout(() => {
            editor.load();
          }, 10);
        });

        /**
         * On change and keyup update original textarea (tinymce does not do this)
         */
        const changeHandler = function () {
          const textarea = document.querySelector('#floatForm textarea');
          if (textarea) {
            editor.save();
            let evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            textarea.dispatchEvent(evt);
          }
        };
        editor.on('Change', changeHandler);
        editor.on('keyup', changeHandler);
        editor.shortcuts.add("ctrl+13", "Submit!", function () {
          frontToBack({
            target: 'floatForm',
            evt: 'enter'
          });
        });

        focusBeforeTemplate(editor);

        /**
         * Three lines below should move cursor to the end of text (when editing comment) but unfortunately this
         * method doesn't work for some reason. I'll left this code here, anyway. Maybe I'll find a way to fix it.
         */
        editor.focus();
        editor.selection.select(editor.getBody().lastChild, true);
        editor.selection.collapse(false);

        /**
         * Need to call change handler to disable button if editor is empty
         */
        changeHandler();
      }
    });

    /**
     * Listen for messages from other side
     */
    window.addEventListener("backToFront", function (e) {
      if (e.detail) {
        switch (e.detail.target) {
          case 'floatForm':
            switch (e.detail.evt) {
              case 'insert':
                /**
                 * Floating form is open - init tinymce
                 */
                tinymce.init(floatFormConfig);
                break;

              case 'insert-edit': {
                let timer;
                /**
                 * Floating form is open in edit mode - init tinymce, wait for content and update editor
                 */
                const targetNode = document.querySelector('#floatForm textarea');
                const mutationConfig = {attributes: true, characterData: true, childList: true};
                const callback = debounce(function (changes, observer) {
                  clearTimeout(timer);
                  observer.disconnect();
                  tinymce.init(floatFormConfig);
                }, 100);
                const observer = new MutationObserver(callback);
                observer.observe(targetNode, mutationConfig);
                /**
                 * Ensure that callback will be called in cases of too fast/slow connection
                 */
                timer = setTimeout(function () {
                  callback(null, observer);
                }, 5000);
                break;
              }
            }
            break;
        }
      }
    });

    /**
     * Add image and video previews
     */
    addImagePreviews(config.mediaPreviewSize);
    /**
     * Highlight all code
     */
    highlightCode();

    /**
     * When comment list changes - update previews and code highlighting
     */
    commentsMutationCallbacks.push(function () {
      addImagePreviews(config.mediaPreviewSize);
      highlightCode();
    });

    /**
     * Listen for messages from popup to update previews if user changes config
     */
    chrome.runtime.onMessage.addListener(
      function (request, sender) {
        if (!sender.tab) {
          switch (request.action) {
            case 'update-config':
              chrome.storage.sync.get(function (config) {
                config = extend(defaultConfig, config);
                addImagePreviews(config.mediaPreviewSize);
              });
              break;
          }
        }
      }
    );
  });
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}
