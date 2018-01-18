/* global chrome */
import createPreprocessor from '../utils/paste-preprocessor';

/**
 * Default TinyMCE config according to tags acceptable by dou
 */
export default function (extensionConfig) {
  const conf = {
    menu: {
      edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
      format: {
        title: 'Format',
        items: 'bold italic strikethrough | removeformat'
      }
    },
    menubar: false,
    toolbar1: 'code | undo redo | cut copy paste pastetext | template | searchreplace | styleselect',
    toolbar2: 'bold italic strikethrough removeformat | link unlink | blockquote codesample | bullist numlist | tinymceEmoji',
    plugins: 'lists code codesample paste autolink searchreplace template link autoresize tinymceEmoji',
    style_formats: [
      {
        title: 'Inline',
        items: [
          {title: 'Bold', icon: 'bold', format: 'bold'},
          {title: 'Italic', icon: 'italic', format: 'italic'},
          {title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
        ]
      },

      {
        title: 'Blocks',
        items: [
          {title: 'Quote', format: 'blockquote'},
          {title: 'Pre', format: 'pre'},
          {title: 'Code', format: 'code'},
        ]
      }
    ],
    block_formats: (
      'Paragraph=p;' +
      'Heading 1=h1;' +
      'Heading 2=h2;' +
      'Heading 3=h3;' +
      'Heading 4=h4;' +
      'Heading 5=h5;' +
      'Heading 6=h6;'
    ),
    formats: {
      alignleft: {selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-align-left'},
      aligncenter: {
        selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
        classes: 'text-align-center'
      },
      alignright: {selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-align-right'},
      alignjustify: {
        selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
        classes: 'text-align-justify'
      },
      bold: {inline: 'b'},
      italic: {inline: 'i'},
      underline: {inline: 'u'},
      strikethrough: {inline: 'del'},
    },
    custom_undo_redo_levels: 10,
    content_css: chrome.runtime.getURL("css/tinymce-content.css"),
    paste_as_text: true,
    codesample_languages: [
      {text: 'None', value: 'none'},
      {text: '1C', value: '1c'},
      {text: 'Apache', value: 'apache'},
      {text: 'AppleScript', value: 'applescript'},
      {text: 'Bash', value: 'bash'},
      {text: 'Basic', value: 'basic'},
      {text: 'C#', value: 'csharp'},
      {text: 'C++', value: 'cpp'},
      {text: 'CSS', value: 'css'},
      {text: 'Clojure', value: 'clojure'},
      {text: 'CoffeeScript', value: 'coffeescript'},
      {text: 'Diff', value: 'diff'},
      {text: 'HTML/XML', value: 'xhtml'},
      {text: 'HTTP', value: 'http'},
      {text: 'Ini', value: 'ini'},
      {text: 'JSON', value: 'json'},
      {text: 'Java', value: 'java'},
      {text: 'JavaScript', value: 'javascript'},
      {text: 'Less', value: 'less'},
      {text: 'PHP', value: 'php'},
      {text: 'Python', value: 'python'},
      {text: 'Ruby', value: 'ruby'},
      {text: 'SCSS', value: 'scss'},
    ],
    templates: extensionConfig.templates,
    link_context_toolbar: true,
    autoresize_max_height: 700,
    emoji_show_twemoji: !!extensionConfig.twemoji,
    emoji_twemoji_size: 24,
    emoji_twemoji_attrs: {
      style: "vertical-align: bottom; margin: 0 .05em .1em .1em; display: inline-block;"
    },
    emoji_twemoji_ext: '.svg',
    emoji_twemoji_folder: 'svg',
    paste_preprocess: createPreprocessor(),
  };

  return conf;
}
