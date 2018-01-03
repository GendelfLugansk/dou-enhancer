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
              window.$('#inlineForm textarea').triggerHandler('focus');
              break;

            case 'blur':
              /**
               * Editor blurred
               */
              window.$('#inlineForm textarea').triggerHandler('blur');
              break;

            case 'enter': {
              const submitButton = window.$('#inlineForm input[type=submit]');
              /**
               * Ctrl+Enter is tricky - we need to trigger mousedown and mouseup (click doesn't work) events to send
               * message and then blur to start j/k shortcuts
               */
              submitButton.triggerHandler('mousedown');
              submitButton.triggerHandler('mouseup');
              window.$('#inlineForm textarea').triggerHandler('blur');
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
               * Ctrl+Enter
               */
              const submitButton = window.$('#floatForm input[type=submit]');
              submitButton.triggerHandler('mousedown');
              submitButton.triggerHandler('mouseup');
              window.$('#floatForm textarea').triggerHandler('blur');
              break;
            }
          }
          break;
      }
    }
  });

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
