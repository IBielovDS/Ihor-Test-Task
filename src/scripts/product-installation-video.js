customElements.component = "product-installation-video";

if (!customElements.get(customElements.component)) {
  class ProductInstallationVideo extends HTMLElement {
    constructor() {
      super();

      this.fancyBoxElms = this.querySelectorAll('[data-fancybox]');
    }

    connectedCallback() {
      if (this.fancyBoxElms.length) Fancybox.bind('[data-fancybox]', {
        Thumbs: false,
        groupAttr: 'none',
      });
    }
  }
  customElements.define(customElements.component, ProductInstallationVideo);
}