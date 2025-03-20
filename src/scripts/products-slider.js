customElements.component = 'products-slider';

if (!customElements.get(customElements.component)) {
  class ProductsSlider extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
      this.activeGroup = 'all';
      this.progressBar = this.querySelector('.product-slider__desktop-progress');
      this.mobileThumbs = this.querySelector('.product-slider__mobile-thumbs');
      this.prevButton = this.querySelector('.product-slider__desktop-nav__prev');
      this.nextButton = this.querySelector('.product-slider__desktop-nav__next');
      this.filterButtons = this.querySelectorAll('.products-slider__top-categories button');
      this.slides = this.querySelectorAll('.swiper-wrapper .swiper-slide');
    }

    init() {
      this.initializeSwiper();
      this.addEventListeners();
    }

    initializeSwiper() {
      const swiperOptions = {
        slidesPerView: 1.15,
        spaceBetween: 0,
        grabCursor: true,
        watchSlidesProgress: true,
        pagination: {
          el: this.mobileThumbs,
          clickable: true,
          type: 'bullets',
          dynamicBullets: true,
        },
        navigation: {
          prevEl: this.prevButton,
          nextEl: this.nextButton
        },
        breakpoints: {
          768: {
            slidesPerView: 2.2,
            spaceBetween: 0
          },
          1024: {
            slidesPerView: 3.74,
            spaceBetween: 0
          }
        },
        on: {
          init: () => {
            setTimeout(() => this.updateProgressBar(), 0);
          },
          slideChange: () => this.updateProgressBar()
        }
      };

      this.swiper = new Swiper(this.querySelector('.swiper'), swiperOptions);
    }

    updateProgressBar() {
      if (!this.progressBar || !this.swiper) return;

      try {
        const visibleSlides = this.getVisibleSlides();
        const totalSlides = visibleSlides.length;
        const slidesPerView = this.swiper.params?.slidesPerView || 1;

        const maxPossibleIndex = Math.max(0, totalSlides - Math.ceil(slidesPerView));

        if (maxPossibleIndex <= 0) {
          this.progressBar.style.display = 'none';
          if (this.prevButton) this.prevButton.style.display = 'none';
          if (this.nextButton) this.nextButton.style.display = 'none';
          return;
        }

        this.progressBar.style.display = '';
        if (this.prevButton) this.prevButton.style.display = '';
        if (this.nextButton) this.nextButton.style.display = '';

        const currentIndex = this.swiper.activeIndex || 0;
        const singleSlidePercent = (1 / maxPossibleIndex) * 100;
        let progress = singleSlidePercent + (currentIndex / maxPossibleIndex) * (100 - singleSlidePercent);

        progress = Math.max(singleSlidePercent, Math.min(100, progress));

        if (currentIndex >= maxPossibleIndex) {
          progress = 100;
        }

        this.progressBar.innerHTML = `
          <div class="progress-bar">
            <div class="progress" style="width: ${progress}%"></div>
          </div>
        `;
      } catch (error) {
        console.warn('Error updating progress bar:', error);
      }
    }

    getVisibleSlides() {
      if (this.activeGroup === 'all') {
        return this.slides;
      }
      return Array.from(this.slides).filter(slide =>
        slide.dataset.group === this.activeGroup
      );
    }

    filterSlides(group) {
      this.activeGroup = group;

      this.slides.forEach(slide => {
        if (group === 'all' || slide.dataset.group === group) {
          slide.style.display = '';
        } else {
          slide.style.display = 'none';
        }
      });

      if (this.swiper) {
        this.swiper.update();
        this.swiper.slideTo(0);
        this.updateProgressBar();
      }
    }

    addEventListeners() {
      if (!this.filterButtons.length) return;
      this.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          this.filterSlides(button.dataset.group);
        });
      });
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

  customElements.define(customElements.component, ProductsSlider);
}