customElements.component = 'product-tabs';

if (!customElements.get(customElements.component)) {
  class ProductTabs extends HTMLElement {
    constructor() {
      super();
      this.html = document.querySelector('html');
      this.links = this.querySelectorAll('a');
      this.headerHeight = 0;
      this.height = this.getBoundingClientRect().height;
      this.top = this.offsetTop;
      this.section = this.closest(".shopify-section");
    }

    calculatePosition() {
      this.header = document.querySelector('.js-header-section');
      this.header && (this.headerHeight = this.header.getBoundingClientRect().height);
      const blockTopPosition = `${this.headerHeight}px`;
      const scrollTopPadding = `${this.headerHeight + this.height - 1}px`;
      this.section.style.top = blockTopPosition;
      this.html.style.scrollPaddingTop = scrollTopPadding;
    }

    handleScroll() {
      if (window.pageYOffset >= this.top) {
        this.classList.add("active-scroll");
      } else {
        this.classList.remove("active-scroll");
      }

      if (this.classList.contains("active-scroll")) {
        this.links.forEach((link) => {
          const target = document.querySelector(link.getAttribute("href"));
          const topOffset = this.headerHeight + this.height;

          if (target) {
            const rect = target.getBoundingClientRect();

            if (rect.top <= topOffset && rect.bottom >= topOffset) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          }
        });
      } else {
        this.links[0].classList.add('active');
      }
    }

    checkBlocks() {
      this.links.forEach(link => {
        const block = document.querySelector(link.getAttribute("href"));

        if (!block) link.classList.add('hidden');
      });
    }

    addEventListener() {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    removeEventListener() {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    connectedCallback() {
      this.checkBlocks();
      this.calculatePosition();
      this.addEventListener();
    }

    disconnectedCallback() {
      this.removeEventListener();
    }
  }

  customElements.define(customElements.component, ProductTabs);
}
