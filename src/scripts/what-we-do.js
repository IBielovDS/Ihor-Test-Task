customElements.component = "what-we-do";

if (!customElements.get(customElements.component)) {
  class WhatWeDo extends HTMLElement {
    constructor() {
      super();
      this.slider = this.querySelector(".js-what-we-do-slider");
    }

    initializeSlider() {
      this.slides = this.slider.querySelectorAll('.swiper-slide');

      const swiperOptions = {
        slidesPerView: 1.25,
        spaceBetween: 8,
        pagination: {
          el: ".swiper-pagination",
          type: "progressbar",
        },
        breakpoints: {
          768: {
            slidesPerView: 3,
            spaceBetween: 24,
          }
        },
      };

      this.swiper = new Swiper(this.slider, swiperOptions);
    }

    connectedCallback() {
      this.initializeSlider();
    }

    disconnectedCallback() {
      if (this.swiper) {
        this.swiper.destroy();
      }
    }
  }

  customElements.define(customElements.component, WhatWeDo);
}