import mediaSizes from "../config/media-sizes";
import profiler from '../utils/profiler';

/**
 * Calls callback function when all images are loaded or after timeout
 *
 * @param {Array} images Array of image elements, created with document.createElement("img")
 * @param {Function} cb Callback
 * @param timeout Maximum wait time (in ms). After this callback will be called even if images not loaded
 */
const imageLoadChecker = function (images, cb, timeout = 3000) {
  let timeSpent = 0;
  const tick = 100;

  const checker = () => {
    if (timeSpent >= timeout) {
      cb();
      return;
    }

    for (let i = 0; i < images.length; i++) {
      if (!images[i].complete) {
        setTimeout(() => {
          timeSpent += tick;
          checker()
        }, tick);
        return;
      }
    }

    cb();
  };
  checker();
};

/**
 * This function processes all comments and adds image previews to comments that contain links to image file.
 * Also, it embeds YT videos if comment contains link to YT video.
 *
 * @param {{}} config Extension config
 * @param {Boolean} force Force rebuild for links marked as processed (for config update)
 */
const addImagePreviews = function (config, force) {
  profiler.start('addImagePreviews');

  mediaSizes.forEach(size => {
    document.body.classList.remove('dou-enhancer-media-size-' + size);
  });
  document.body.classList.add('dou-enhancer-media-size-' + config.mediaPreviewSize);

  const comments = document.querySelectorAll('#commentsList .comment .b-typo');
  comments.forEach(comment => {
    if (force) {
      comment.querySelectorAll(".dou-enhancer-lightbox, .dou-enhancer-image-preview").forEach(remnant => {
        remnant.remove();
      });
    }

    if (!config.mediaPreview) {
      return;
    }

    const links = comment.querySelectorAll('a');
    if (links.length > 0) {
      const processedMark = 'dou-enhancer-processed';
      let media = [];

      links.forEach(link => {
        if (!link.classList.contains(processedMark) || force) {
          link.classList.add(processedMark);

          const src = link.href;
          const imgRe = /\.(png|jpg|gif|jpeg|bmp|tiff)(\?.*)?$/gi;
          const ytRe = /^((https|http):\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([^&?]+).*/gi;
          const isImg = (src.search(imgRe) !== -1);
          const isYT = (src.search(ytRe) !== -1);
          if (isImg || isYT) {
            let previewImage = src;
            if (isYT) {
              const matches = ytRe.exec(src);
              previewImage = "https://img.youtube.com/vi/" + matches[6] + "/maxresdefault.jpg";
            }

            media.push({
              isImg, isYT, src, previewImage
            });
          }
        }
      });

      if (media.length > 1) {
        let images = [];
        let grid = document.createElement('div');
        grid.setAttribute('uk-grid', '');
        grid.classList.add(
          "uk-child-width-1-" + Math.min(media.length, config.mediaGridColumns) + "@m", "uk-grid-small", "dou-enhancer-lightbox"
        );

        media.forEach(item => {
          let img = document.createElement("img");
          img.setAttribute("uk-cover", "");
          img.src = item.previewImage;

          images.push(img);

          let a = document.createElement("a");
          a.classList.add("uk-cover-container", processedMark);
          a.setAttribute("href", item.src);

          if (item.isImg) {
            a.setAttribute("data-type", "image");
          }

          a.appendChild(img);

          let aspectRatioContainer = document.createElement("div");
          aspectRatioContainer.appendChild(a);

          let column = document.createElement("div");
          column.appendChild(aspectRatioContainer);

          grid.appendChild(column);
        });

        grid.setAttribute('uk-lightbox', 'animation: slide');

        /**
         * Wait a bit to load all images for correct covers
         */
        imageLoadChecker(images, () => {
          comment.appendChild(grid);
        });
      } else if (media.length > 0) {
        media.forEach(item => {
          let img = document.createElement("img");
          img.src = item.previewImage;

          let a = document.createElement("a");
          a.classList.add(processedMark);
          a.setAttribute("href", item.src);
          a.appendChild(img);

          let div = document.createElement("div");
          div.classList.add('dou-enhancer-image-preview');
          div.setAttribute('uk-lightbox', 'animation: slide; video-autoplay: true');
          div.appendChild(a);

          comment.appendChild(div);
        });
      }
    }
  });

  profiler.stop('addImagePreviews');
};

export default addImagePreviews;
