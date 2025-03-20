customElements.component = 'video-reviews-carousel';

if (!customElements.get(customElements.component)) {
  class VideoReviewsCarousel extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
      this.progressBar = this.querySelector('.video-reviews-carousel__desktop-progress');
      this.mobileThumbs = this.querySelector('.video-reviews-carousel__mobile-thumbs');
      this.prevButton = this.querySelector('.video-reviews-carousel__desktop-nav__prev');
      this.nextButton = this.querySelector('.video-reviews-carousel__desktop-nav__next');
      this.videos = this.querySelectorAll('video');
    }

    init() {
      this.initializeSwiper();
      this.updateProgressBar();
      this.addEventListeners();
    }

    initializeSwiper() {
      const swiperOptions = {
        slidesPerView: 1.2,
        spaceBetween: 16,
        grabCursor: true,
        watchSlidesProgress: true,
        pagination: {
          el: this.mobileThumbs,
          clickable: true,
          type: 'bullets'
        },
        navigation: {
          prevEl: this.prevButton,
          nextEl: this.nextButton
        },
        breakpoints: {
          768: {
            slidesPerView: 2.2,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 4.1,
            spaceBetween: 24
          }
        },
        on: {
          slideChange: () => this.updateProgressBar()
        }
      };

      this.swiper = new Swiper(this.querySelector('.swiper'), swiperOptions);
    }

    updateProgressBar() {
      if (!this.progressBar) return;

      const totalSlides = this.swiper.slides.length;
      const visibleSlidesPerView = this.swiper.params.slidesPerView;
      const lastPossibleSlideIndex = Math.max(0, totalSlides - Math.floor(visibleSlidesPerView));

      // Calculate progress starting from page 1 instead of 0
      const currentIndex = this.swiper.activeIndex + 1;
      const totalPages = lastPossibleSlideIndex + 1;
      const finalProgress = Math.min(100, (currentIndex / totalPages) * 100);

      this.progressBar.innerHTML = `
        <div class="progress-bar h-4 bg-grey mt-8 w-full">
          <div class="progress h-full bg-black-200 transition-all" style="width: ${finalProgress}%"></div>
        </div>
      `;
    }

    addEventListeners() {
      if (this.videos.length) {
        this.videos.forEach(video => {
          video.addEventListener('click', () => {
            video.muted = !video.muted;
          });
        });
      }
    }

    connectedCallback() {
      if (window.Swiper) {
        this.init();
      } else {
        window.addEventListener('load', () => this.init());
      }
    }

    disconnectedCallback() {
      if (this.swiper) {
        this.swiper.destroy();
      }
    }
  }

  customElements.define(customElements.component, VideoReviewsCarousel);
}