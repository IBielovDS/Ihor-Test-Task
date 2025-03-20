customElements.component = 'custom-tooltip';

if (!customElements.get(customElements.component)) {
  class Tooltip extends HTMLElement {
    constructor() {
      super();
      this.close = this.querySelector('.js-tooltip-close');
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }

    handleCloseTooltip() {
      this.toggleTargetClass(this, 'open', false);
    }

    addEventListeners() {
      this.close && this.close.addEventListener('click', this.handleCloseTooltip.bind(this));
    }

    removeEventListeners() {
      this.close && this.close.removeEventListener('click', this.handleCloseTooltip.bind(this));
    }

    connectedCallback() {
      this.addEventListeners();
    };

    disconnectedCallback() {
      this.removeEventListeners();
    };
  }

  customElements.define(customElements.component, Tooltip);
}