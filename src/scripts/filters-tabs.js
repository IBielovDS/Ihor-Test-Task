customElements.component = "filters-tabs";

if (!customElements.get(customElements.component)) {
  class FiltersTabs extends HTMLElement {
    constructor() {
      super();
      this.slider = null;
      this.tabs = null;
      this.swiper = this.querySelector(".swiper");
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initSelectors();
      this.initSlider();
    }

    initSelectors() {
      this.tabs = this.querySelectorAll("[data-filters-tab]");
    }

    initSlider() {
      this.slider = new Swiper(this.swiper, {
        slidesPerView: "auto",
        freeMode: true,
        spaceBetween: 8,
        loop: false,
        scrollbar: {
          el: this.querySelector(".swiper-scrollbar"),
        },
      });
    }

    disconnectedCallback() {
      this.slider.destroy();
    }
  }

  customElements.define(customElements.component, FiltersTabs);
}
