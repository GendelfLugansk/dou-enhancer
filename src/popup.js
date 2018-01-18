import Options from './utils/options'

const fn = function () {
  new Options();
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}

