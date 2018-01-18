import Options from './utils/options';
import TemplatesEditor from './utils/templates-editor';

const ExtendedOptions = function () {
  Options.apply(this, arguments);
};
ExtendedOptions.prototype = Object.create(Options.prototype);
ExtendedOptions.prototype.constructor = ExtendedOptions;
ExtendedOptions.prototype.setup = function (config) {
  Options.prototype.setup.apply(this, arguments);
  new TemplatesEditor(document.getElementById("templatesContainer"), config.templates, () => {
    this.saveChanges(config);
  });
};

const fn = function () {
  new ExtendedOptions();
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  fn();
}
else {
  document.addEventListener("DOMContentLoaded", fn);
}
