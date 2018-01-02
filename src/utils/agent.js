/**
 * This function will be injected in a such way that it will work in website's context
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

  if (
    !window.commentsManager && window.CommentsManager &&
    (document.querySelector('#inlineForm textarea') || document.querySelector('#floatForm textarea'))
  ) {
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

const injectAgent = function () {
  /**
   * This code allows to bypass context limitations
   *
   * @see https://stackoverflow.com/a/21784877/2948109
   */
  const scr = document.createElement('script');
  scr.textContent = '(' + otherSideFunc + ')();';
  (document.head || document.documentElement).appendChild(scr);
  scr.parentNode.removeChild(scr);
};

export default injectAgent;
