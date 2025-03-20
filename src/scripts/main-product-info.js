customElements.component = 'main-product-info';

if (!customElements.get(customElements.component)) {
  class MainProductInfo extends HTMLElement {
    constructor() {
      super();
      this.wrapper = this.closest('.main-product-wrapper');
      this.galleryWrapper = this.wrapper.querySelector('.main-product-wrapper__gallery');
      this.mobileElement = this.wrapper.querySelector('.main-product-wrapper__gallery-mobile');
      this.productInfo = this;
      this.titleElement = this.querySelector('.product_title');
      this.variantRadiosElement = this.querySelector('.variant-radios-block');
      this.priceElement = this.querySelector('.price_block');
      this.modalsElement = this.querySelector('.modals-wrapper');
      this.starsElement = this.querySelector('.tag_with_stars');
      this.variantSelector = this.querySelector('.color-options');
      this.fancyBoxElms = this.querySelectorAll('[data-fancybox]');

      this.isMobile = window.innerWidth < 1024;
      this.originalOrder = this.captureOriginalOrder();
      this.originalParents = this.storeOriginalParents();

      this.handleResize = this.handleResize.bind(this);
    }

    captureOriginalOrder() {
      const elements = [...this.children];
      return elements.reduce((order, element, index) => {
        order.set(element, index);
        return order;
      }, new Map());
    }

    storeOriginalParents() {
      const positions = new Map();
      [this.variantRadiosElement].forEach(element => {
        if (element) {
          positions.set(element, {
            parent: element.parentElement,
            nextSibling: element.nextElementSibling
          });
        }
      });
      return positions;
    }

    moveElements() {
      if (!this.mobileElement) return;

      if (this.isMobile) {
        const mobileOrder = [this.starsElement, this.titleElement, this.variantRadiosElement];
        mobileOrder.forEach(element => {
          if (element) this.mobileElement.appendChild(element);
        });

        if (this.priceElement && this.modalsElement && this.galleryWrapper) {
          this.galleryWrapper.after(this.modalsElement);
          this.modalsElement.after(this.priceElement);
        }

        if (this.variantSelector) {
          this.galleryWrapper.before(this.variantSelector);
        }
      } else {
        const sortedElements = [...this.originalOrder.entries()]
          .sort((a, b) => a[1] - b[1])
          .map(([element]) => element);

        sortedElements.forEach(element => {
          if (element !== this.variantRadiosElement) {
            this.productInfo.appendChild(element);
          }
        });

        this.originalParents.forEach(({ parent, nextSibling }, element) => {
          if (nextSibling && parent.contains(nextSibling)) {
            parent.insertBefore(element, nextSibling);
          } else {
            parent.appendChild(element);
          }
        });
      }
    }

    init() {
      this.startFancyBox();
      if (this.isMobile) this.moveElements();
      this.setupEventListeners();
    }

    handleResize() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 1024;
      if (wasMobile !== this.isMobile) this.moveElements();
    }

    setupEventListeners() {
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(this.handleResize, 250);
      });
    }

    startFancyBox() {
      if (this.fancyBoxElms.length) Fancybox.bind('[data-fancybox]');
    }

    connectedCallback() {
      this.init();
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  customElements.define(customElements.component, MainProductInfo);
}