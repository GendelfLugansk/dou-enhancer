/**
 * Default extension config (will be stored via chrome.storage.sync)
 */
export default {
  mediaPreview: true,
  mediaPreviewSize: 'small',
  mediaGridColumns: 4,
  expandThreads: true,
  twemoji: true,
  templates: [
    {title: 'Не читал, осуждаю', description: 'Не читал, осуждаю', content: 'Не читал, но осуждаю'},
    {title: 'Читал, осуждаю', description: 'Читал, осуждаю', content: 'Читал, но всё равно осуждаю'},
  ],
};
