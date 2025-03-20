customElements.component = "product-media-gallery";

if (!customElements.get(customElements.component)) {
  class NewProductMediaGallery extends HTMLElement {
    constructor() {
      super();
      this.sliderTop = this.querySelector(".product-media-gallery__top");
      this.sliderBottom = this.querySelector(".product-media-gallery__bottom");
      this.navPrev = this.querySelector(".product-media-galllery-prev");
      this.navNext = this.querySelector(".product-media-galllery-next");
      this.pagination = this.querySelector(".swiper-pagination");
      this.imageConfig = this.querySelector(".image-config");
      this.imageData = JSON.parse(this.imageConfig.textContent.trim());
      this.variantsCount = Number(this.getAttribute("data-variants-count"));

      document.addEventListener("variant:changed", (event) => this.handleColorChange(event.detail.color));
    }

    handleColorChange(color) {
      if (!color || this.variantsCount <= 1) return;

      const mainWrapper = this.sliderTop.querySelector(".swiper-wrapper");
      const thumbWrapper = this.sliderBottom.querySelector(".swiper-wrapper");
      const filteredSlides = this.generateFilteredSlides(color);

      if (!filteredSlides.main || !filteredSlides.thumbs) return;

      this.destroySwipers();

      if (filteredSlides.main) {
        mainWrapper.innerHTML = filteredSlides.main;
      }
      if (filteredSlides.thumbs) {
        thumbWrapper.innerHTML = filteredSlides.thumbs;
      }

      this.initializeSliders();
      this.updateThumbsState(0);
      this.initFancybox(color);
    }

    generateFilteredSlides(color) {
      const slides = {
        main: "",
        thumbs: "",
      };

      this.imageData.images.forEach(({ url, alt, width }, index) => {
        const fullUrl = "https:" + url.replace(/\\/g, "");
        const srcsetSizes = [
          10, 20, 30, 40, 50, 75, 100, 150, 200, 250, 320, 480, 576, 768, 992, 1024, 1220, 1440, 1680, 1920, 2000, 2180,
        ];
        const srcset = srcsetSizes
          .map((size) => {
            if (size > width) return false;
            const separator = fullUrl.includes("&") ? "&width=" : "?width=";
            return `${fullUrl}${separator}${size} ${size}w`;
          })
          .filter(Boolean)
          .join(", ");
        const altParts = alt.split(" | ");
        const slideColor = altParts[altParts.length - 1]?.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
        const currentColor = color.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

        if (slideColor === currentColor) {
          slides.main += `
            <div class="swiper-slide top__slide !h-fit relative">
              <a data-fancybox="gallery" href="${fullUrl}" data-color="${slideColor}">
                <img 
                  src="${fullUrl}"
                  alt="${alt}"
                  srcset="${srcset}"
                  class="aspect-square object-contain w-full h-full"
                  fetchpriority="${index === 0 ? "high" : "auto"}"
                  loading="${index === 0 ? "eager" : "lazy"}"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </a>
            </div>
          `;

          slides.thumbs += `
            <div class="swiper-slide cursor-pointer rounded-4 border border-solid border-transparent transition-all opacity-50 [&.swiper-slide-thumb-active]:transition-all [&.swiper-slide-thumb-active]:border-black-200 [&.swiper-slide-thumb-active]:opacity-100 relative aspect-square [&_img]:text-0">
              <img 
                src="${fullUrl}"
                alt="${alt}"
                srcset="${srcset}"
                class="aspect-auto rounded-4 object-cover object-center w-full h-full absolute top-0 left-0"
                fetchpriority="${index === 0 ? "high" : "auto"}"
                loading="${index === 0 ? "eager" : "lazy"}"
                sizes="80px"
              />
            </div>
          `;
        }
      });

      return slides;
    }

    initFancybox(color) {
      Fancybox.unbind('[data-fancybox="gallery"]');

      const options = {
        ...this.getFancyboxOptions(),
        on: {
          ...this.getFancyboxOptions().on,
          "Carousel.ready": (fancybox) => {
            const slides = Array.from(fancybox.carousel.slides);
            const filtered = slides.filter((slide) => {
              const imgSrc = slide.src;
              const imageData = this.imageData.images.find((img) => {
                const fullUrl = "https:" + img.url.replace(/\\/g, "");
                return fullUrl === imgSrc;
              });
              if (!imageData) return false;
              const altParts = imageData.alt.split(" | ");
              const slideColor = altParts[altParts.length - 1]?.toLowerCase();
              return slideColor === color.toLowerCase();
            });
            fancybox.carousel.slides = filtered;
          },
        },
      };

      Fancybox.bind('[data-fancybox="gallery"]', options);
    }

    getFancyboxOptions() {
      return {
        tpl: {
          closeButton:
            '<button data-fancybox-close class="f-button is-close-btn" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg></button>',
          main: `<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">
            <div class="fancybox__backdrop"></div>
            <div class="fancybox__carousel"></div>
            <div class="fancybox__counter">
              <span class="current"></span>
              <span class="total"></span>
            </div>
            <div class="fancybox__footer"></div>
          </div>`,
        },
        Toolbar: {
          display: {
            left: [],
            middle: ["zoomIn", "zoomOut"],
            right: ["close"],
          },
        },
        Thumbs: {
          type: "classic",
          Carousel: {
            fill: true,
            preload: 1,
          },
        },
        Slideshow: false,
        Fullscreen: false,
        Image: {
          zoom: true,
          click: false,
          wheel: "zoom",
          Panzoom: {
            panOnlyZoomed: true,
          },
        },
        animated: false,
        dragToClose: false,
      };
    }

    initializeSliders() {
      this.activeSliderBottom = new Swiper(this.sliderBottom, {
        slidesPerView: 7,
        spaceBetween: 8,
        freeMode: true,
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        on: {
          init: (swiper) => {
            swiper.slides.forEach((slide, index) => {
              slide.addEventListener("click", () => {
                this.activeSliderTop.slideTo(index);
                this.updateThumbsState(index);
              });
            });
          },
        },
      });

      this.activeSliderTop = new Swiper(this.sliderTop, {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
          nextEl: this.navNext,
          prevEl: this.navPrev,
        },
        thumbs: {
          swiper: this.activeSliderBottom,
          slideThumbActiveClass: "swiper-slide-thumb-active",
        },
        pagination: {
          el: this.pagination,
          clickable: true,
          type: "bullets",
          dynamicBullets: true,
          dynamicMainBullets: 5,
        },
        on: {
          slideChange: (swiper) => {
            if (this.pagination) {
              const bullets = this.pagination.querySelectorAll(".swiper-pagination-bullet");
              bullets.forEach((bullet, index) => {
                bullet.classList.toggle("swiper-pagination-bullet-active", index === swiper.activeIndex);
              });
            }
            this.updateThumbsState(swiper.activeIndex);
          },
        },
      });

      this.updateSwiperStates();
    }

    updateThumbsState(activeIndex) {
      if (this.activeSliderBottom && this.activeSliderBottom.slides) {
        this.activeSliderBottom.slides.forEach((slide, index) => {
          slide.classList.remove("swiper-slide-thumb-active");

          if (index === activeIndex) {
            slide.classList.add("swiper-slide-thumb-active");
          }
        });

        this.activeSliderBottom.slideTo(activeIndex);
      }
    }

    updateSwiperStates() {
      if (this.activeSliderBottom && this.activeSliderBottom.slides) {
        this.activeSliderBottom.slides.forEach((slide, index) => {
          slide.classList.toggle("swiper-slide-thumb-active", index === this.activeSliderTop.activeIndex);
        });
      }
    }

    destroySwipers() {
      if (this.activeSliderTop) {
        this.activeSliderTop.destroy(true, true);
        this.activeSliderTop = null;
      }
      if (this.activeSliderBottom) {
        this.activeSliderBottom.destroy(true, true);
        this.activeSliderBottom = null;
      }
    }

    connectedCallback() {
      const checkSwiper = setInterval(() => {
        if (typeof Swiper !== "undefined") {
          this.initializeSliders();
          clearInterval(checkSwiper);
        }
      }, 100);
    }

    disconnectedCallback() {
      this.destroySwipers();
      Fancybox.unbind('[data-fancybox="gallery"]');
    }
  }

  customElements.define(customElements.component, NewProductMediaGallery);
}
