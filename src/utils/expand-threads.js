import profiler from '../utils/profiler';

/**
 * Expands all threads by "clicking" on each expand link
 */
const expandThreads = function () {
  profiler.start('expandThreads');
  document.querySelectorAll('.expand-thread').forEach(thread => {
    thread.click();
  });
  profiler.stop('expandThreads');
};

export default expandThreads;
