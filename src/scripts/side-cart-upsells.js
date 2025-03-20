customElements.component = "side-cart-upsells";

if (!customElements.get(customElements.component)) {
  class SideCartUpsells extends HTMLElement {
    constructor() {
      super();
      this.slider = null;
      this.swiper = this.querySelector(".swiper");
      this.pagination = this.querySelector(".swiper-pagination");
    }

    connectedCallback() {
      this.init();
    }

    disconnectedCallback() {
      this.slider && this.slider.destroy();
    }

    init() {
      setTimeout(() => {
        this.initSlider();
      }, 0);
    }

    initSlider() {
      const options = {
        spaceBetween: 0,
        slidesPerView: 1,
        loop: false,
        pagination: {
          el: this.pagination,
          clickable: true,
        },
        breakpoints: {
          768: {
            spaceBetween: 8,
            slidesPerView: 1.2,
            slidesOffsetAfter: 32,
          },
        },
      };
      this.slider = new Swiper(this.swiper, options);
    }
  }

  customElements.define(customElements.component, SideCartUpsells);
}
