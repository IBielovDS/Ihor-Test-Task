customElements.component = 'our-products-section';

if (!customElements.get(customElements.component)) {
  class ProductsSlider extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        slider: '.js-our-products-slider'
      }
      this.swiper = null;
    }

    init() {
      this.initializeSwiper();
    }

    initializeSwiper() {
      const swiperOptions = {
        slidesPerView: 1.4,
        spaceBetween: 16,
        grabCursor: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          type: 'bullets'
        },
        breakpoints: {
          768: {
            slidesPerView: 2.4
          },
          991: {
            slidesPerView: 3.4
          }
        }
      };

      this.swiper = new Swiper(this.querySelector(this.selectors.slider), swiperOptions);
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