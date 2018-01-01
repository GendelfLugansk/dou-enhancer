export default {
  selector: '#inlineForm textarea',
  menu: {
    edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
    format: {
      title: 'Format',
      items: 'bold italic strikethrough | removeformat'
    }
  },
  menubar: false,
  toolbar: 'undo redo | cut copy paste pastetext | styleselect | bold italic strikethrough removeformat | bullist numlist',
  plugins: 'lists',
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
};
