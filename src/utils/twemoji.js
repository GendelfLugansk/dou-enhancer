import twemoji from '../../node_modules/twemoji/2/twemoji.amd';
import profiler from "./profiler";

const twemojiOptions = {
  ext: '.svg',
  folder: 'svg',
};

const setup = function () {
  profiler.start('twemoji');
  document.querySelectorAll('.b-typo > *:not(pre):not(code)').forEach(el => twemoji.parse(el, twemojiOptions));
  profiler.stop('twemoji');
};

export default setup;
