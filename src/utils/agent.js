/**
 * This function will be injected in a such way that it will work in website's context.
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

  /**
   * When submit button in floating form clicked, blur handler should be triggered in order to restart J/K shortcuts.
   * It's important to use mouseup event, click does not work
   */
  window.$('#floatForm input[type=submit]').on('mouseup', () => {
    window.$('#floatForm textarea').triggerHandler('blur');
  });

  /**
   * Listen for messages from content script. Notice that `triggerHandler`
   * is used everywhere - we don't need to fire events, just run handlers
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
              window.$('#inlineForm textarea').triggerHandler('focus');
              break;

            case 'blur':
              /**
               * Editor blurred
               */
              window.$('#inlineForm textarea').triggerHandler('blur');
              break;

            case 'enter': {
              /**
               * Ctrl+Enter, submit works only if mousedown and mouseup were triggered, not on click
               */
              const submitButton = window.$('#inlineForm input[type=submit]');
              submitButton.triggerHandler('mousedown');
              submitButton.triggerHandler('mouseup');
              break;
            }
          }
          break;

        case 'floatForm':
          switch (e.detail.evt) {
            case 'focus':
              /**
               * Editor focused
               */
              window.$('#floatForm textarea').triggerHandler('focus');
              break;

            case 'blur':
              /**
               * Editor blurred
               */
              window.$('#floatForm textarea').triggerHandler('blur');
              break;

            case 'enter': {
              /**
               * Ctrl+Enter is tricky - we need to trigger mousedown and mouseup (click doesn't work) handlers to send
               * message
               */
              const submitButton = window.$('#floatForm input[type=submit]');
              submitButton.triggerHandler('mousedown');
              submitButton.triggerHandler('mouseup');
              break;
            }
          }
          break;
      }
    }
  });

  /**
   * Modify FloatCommentsForm's methods, to know when form is open (it's hidden by default) and initialize tinyMCE
   * (that part is done by content script)
   */
  if (window.FloatCommentsForm) {
    const insertFormOrig = window.FloatCommentsForm.prototype.insertForm;
    window.FloatCommentsForm.prototype.insertForm = function () {
      insertFormOrig.apply(this, arguments);
      backToFront({
        target: 'floatForm',
        evt: 'insert'
      });
    };

    const insertEditFormOrig = window.FloatCommentsForm.prototype.insertEditForm;
    window.FloatCommentsForm.prototype.insertEditForm = function () {
      insertEditFormOrig.apply(this, arguments);
      backToFront({
        target: 'floatForm',
        evt: 'insert-edit'
      });
    };

    const closeOrig = window.FloatCommentsForm.prototype.close;
    window.FloatCommentsForm.prototype.close = function () {
      closeOrig.apply(this, arguments);
      backToFront({
        target: 'floatForm',
        evt: 'close'
      });
    };
  } else if (document.querySelector('#floatForm textarea')) {
    /**
     * If FloatCommentsForm is not found but floating form exists, it could mean that dou's source was changed and
     * extension would not work correctly. If this message appears on pages other than forum and articles, it's
     * probably just false alert.
     */
    /* eslint-disable no-console */
    console.log('Can\'t find FloatCommentsForm class');
    /* eslint-enable no-console */
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
