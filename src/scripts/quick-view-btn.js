customElements.component = 'quick-view-btn';

if (!customElements.get(customElements.component)) {
  class QuickViewBtn extends HTMLElement {
    constructor() {
      super();
      this.btn = this.querySelector('.js-quick-view-btn');
    }

    connectedCallback() {
      this.btn.addEventListener('click', () => window.openQuickViewModal(this.btn.dataset.url));
    }
  }

  customElements.define(customElements.component, QuickViewBtn);
}