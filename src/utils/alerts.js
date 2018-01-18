import extend from './extend';

/**
 * This class represent a single mesage (alert)
 *
 * @param {String} messageClass Will be used as css-class
 * @param {String} message
 * @constructor
 */
const Message = function (messageClass, message) {
  this.class = String(messageClass);
  this.message = String(message);
};

/**
 * Renders message to DOM
 *
 * @param container
 */
Message.prototype.render = function (container) {
  if (!(container instanceof Element)) {
    container = document.querySelector(container) || document.body;
  }

  const el = document.createElement("div");
  el.setAttribute("uk-alert", "");
  el.classList.add('message');
  el.classList.add(this.class);
  el.innerText = this.message;
  el.addEventListener('click', () => {
    this.remove();
  });
  container.appendChild(el);
  this.el = el;
};

/**
 * Removes message from DOM
 */
Message.prototype.remove = function () {
  if (this.el && this.el.remove) {
    this.el.remove();
  }
};

/**
 * This class helps to manage alerts (flash messages). Message will be removed after timeout (3 sec by default)
 *
 * @param {Element|String} container
 * @param {{timeout: Number}} [config]
 * @constructor
 */
const Alerts = function (container, config) {
  if (!(container instanceof Element)) {
    container = document.querySelector(container) || document.body;
  }

  this.container = container;
  this.messages = [];
  this.config = extend(true, {
    timeout: 3000
  }, config);

  this.container.classList.add('alerts');
};

Alerts.prototype.message = function (messageClass, message, messageConfig) {
  const msg = new Message(messageClass, message);
  msg.render(this.container);
  messageConfig = extend(true, {}, this.config, messageConfig);
  let timer = setTimeout(() => {
    clearTimeout(timer);
    msg.remove();
  }, messageConfig.timeout);
};

Alerts.prototype.success = function (message, messageConfig) {
  return this.message('uk-alert-success', message, messageConfig);
};

Alerts.prototype.failure = function (message, messageConfig) {
  return this.message('uk-alert-danger', message, extend(true, {timeout: 5000}, messageConfig));
};

Alerts.prototype.warning = function (message, messageConfig) {
  return this.message('uk-alert-warning', message, extend(true, {timeout: 5000}, messageConfig));
};

export default Alerts;
