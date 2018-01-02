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

export default frontToBack;
