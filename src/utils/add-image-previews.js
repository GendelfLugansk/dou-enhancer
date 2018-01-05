import mediaSizes from "../config/media-sizes";
import profiler from '../utils/profiler';

/**
 * This function processes all comments and adds image previews to comments that contain links to image file.
 * Also, it embeds YT videos if comment contains link to YT video.
 *
 * @param {String} mediaPreviewSize One of sizes defined in `mediaSizes`
 */
const addImagePreviews = function (mediaPreviewSize) {
  profiler.start('addImagePreviews');
  mediaSizes.forEach(size => {
    document.body.classList.remove('dou-enhancer-media-size-' + size);
  });
  document.body.classList.add('dou-enhancer-media-size-' + mediaPreviewSize);

  if (mediaPreviewSize === 'none') {
    return;
  }

  const links = document.querySelectorAll('#commentsList .comment .text a');
  links.forEach((link) => {
    const processedMark = 'dou-enhancer-processed';
    if (!link.classList.contains(processedMark)) {
      link.classList.add(processedMark);
      let src = link.href;
      if (src.search(/\.(png|jpg|gif|jpeg|bmp|tiff)$/gi) !== -1) {
        let img = document.createElement("img");
        img.src = src;

        let div = document.createElement("div");
        div.classList.add('dou-enhancer-image-preview');
        div.appendChild(img);

        const container = link.closest('.b-typo') || link.parentElement;
        container.appendChild(div);
      } else {
        const ytRe = /^((https|http):\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?(.+)/gi;
        if (src.search(ytRe) !== -1) {
          const matches = ytRe.exec(src);
          let frame = document.createElement("iframe");
          frame.src = "https://www.youtube.com/embed/" + matches[6];
          frame.setAttribute('allow', "encrypted-media");
          frame.setAttribute('gesture', "media");
          frame.setAttribute('frameborder', "0");
          frame.setAttribute('allowfullscreen', '');

          let div = document.createElement("div");
          div.classList.add('dou-enhancer-yt-preview');
          div.appendChild(frame);

          const container = link.closest('.b-typo') || link.parentElement;
          container.appendChild(div);
        }
      }
    }
  });
  profiler.stop('addImagePreviews');
};

export default addImagePreviews;
