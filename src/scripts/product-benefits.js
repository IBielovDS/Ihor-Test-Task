customElements.component = "product-benefits";

if (!customElements.get(customElements.component)) {
  class ProductBenefits extends HTMLElement {
    constructor() {
      super();
      this.sectionScrolled = false;
      this.eventAdded = false;
      this.items = this.querySelector('.js-product-benefit-items');
      this.boundSectionScrollEvent = this.sectionScrollEvent.bind(this);
      this.boundWindowScrollEvent = this.windowScrollEvent.bind(this);
      this.mainSlider = this.querySelector(".js-product-benefits-slider");
    }

    sectionScrollEvent(event) {
      event.preventDefault();
      this.items.scrollTop += event.deltaY;

      if (this.items.scrollTop + this.items.clientHeight >= this.items.scrollHeight) {
        this.sectionScrolled = true;
        this.removeEventListener('wheel', this.boundSectionScrollEvent);
        window.removeEventListener('scroll', this.boundWindowScrollEvent);
      }
    }

    windowScrollEvent() {
      const rect = this.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!this.sectionScrolled && isVisible) {
        this.addEventListener('wheel', this.boundSectionScrollEvent);
      }
    }

    initializeSwiper() {
      if (this.mainSlider) {
        // eslint-disable-next-line
        new Swiper(this.mainSlider, {
          slidesPerView: 1,
          pagination: {
            el: '.js-product-benefits-slider-pagination',
            type: 'fraction',
          },
          navigation: {
            nextEl: '.js-product-benefits-slider-next',
            prevEl: '.js-product-benefits-slider-prev',
          }
        });
      }
    }

    connectedCallback() {
      this.initializeSwiper();

      if (window.innerWidth >= 1024 && !this.eventAdded) {
        window.addEventListener('scroll', this.boundWindowScrollEvent);
        this.eventAdded = true;
      }
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this.init.bind(this));
      window.removeEventListener('scroll', this.boundWindowScrollEvent);
      this.removeEventListener('wheel', this.boundSectionScrollEvent);
    }
  }
  customElements.define(customElements.component, ProductBenefits);
}


