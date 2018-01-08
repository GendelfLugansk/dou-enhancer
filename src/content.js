/* global tinymce, chrome */

import defaultMCEConfig from './config/tinymce-defaults';
import debounce from './utils/debounce';
import extend from './utils/extend';
import frontToBack from './utils/front-to-back';
import defaultConfig from './config/extension-defaults';
import addImagePreviews from './utils/add-image-previews';
import highlightCode from './utils/highlight-code';
import injectAgent from './utils/agent';
import createPreprocessor from './utils/paste-preprocessor'
import profiler from './utils/profiler';
import expandThreads from './utils/expand-threads';

/**
 * Main function which initializes editor
 */
const fn = function () {
  /**
   * First we should get config
   */
  chrome.storage.sync.get(function (conf) {
    let config = extend({}, defaultConfig, conf);
    if (config.profiler) {
      profiler.enable();
    } else {
      profiler.disable();
    }

    injectAgent();

    defaultMCEConfig.paste_preprocess = createPreprocessor();

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
      const callback = debounce(function (mutations) {
        let edited = false, added = false;

        mutations.forEach(mutation => {
          if (mutation.target && mutation.target.id === "commentsList") {
            mutation.addedNodes.forEach(node => {
              if (node.classList && node.classList.contains("b-comment")) {
                added = true;
              }
            });
          }

          if (
            mutation.target &&
            mutation.target.classList &&
            mutation.target.classList.contains("b-typo")
          ) {
            mutation.addedNodes.forEach(node => {
              if (
                !node.classList.contains("dou-enhancer-image-preview") &&
                !node.classList.contains("dou-enhancer-lightbox")
              ) {
                edited = true;
              }
            });
          }
        });

        const args = arguments;
        commentsMutationCallbacks.forEach(cb => {
          cb(added, edited, ...args);
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
      init_instance_callback(editor) {
        commentsMutationCallbacks.push(function (added) {
          if (added) {
            editor.load();
          }
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
      init_instance_callback(editor) {
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
    addImagePreviews(config);
    /**
     * Highlight all code
     */
    highlightCode();
    /**
     * Expand all threads
     */
    if (config.expandThreads) {
      expandThreads();
    }

    /**
     * When comment list changes - update previews and code highlighting
     * TODO: Try to modify comments manager to know exactly when new comments arrive. Mutation observer is not the best
     * tool for what we need
     */
    commentsMutationCallbacks.push(function (added, edited) {
      if (added || edited) {
        addImagePreviews(config);
        highlightCode();
        if (config.expandThreads) {
          expandThreads();
        }
      }
    });

    /**
     * Listen for storage changes
     */
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') {
        chrome.storage.sync.get(function (conf) {
          config = extend({}, defaultConfig, conf);
          if (config.profiler) {
            profiler.enable();
          } else {
            profiler.disable();
          }

          addImagePreviews(config, true);
          highlightCode();
          if (config.expandThreads) {
            expandThreads();
          }
        });
      }
    });
  });
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}
