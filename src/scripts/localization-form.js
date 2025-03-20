customElements.component = 'localization-form';

if (!customElements.get(customElements.component)) {
  class LocalizationForm extends HTMLElement {
    constructor() {
      super();
      this.elements = {
        input: this.querySelector('input[name="language_code"], input[name="country_code"]'),
        button: this.querySelector('button'),
        panel: this.querySelector('ul'),
      };

      this.elements.button.addEventListener('click', this.openSelector.bind(this));
      this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
      this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

      this.querySelectorAll('li').forEach((item) => {
        item.addEventListener('click', this.onItemClick.bind(this));
      });
    }

    hidePanel() {
      this.elements.button.setAttribute('aria-expanded', 'false');
      this.elements.panel.classList.add('hidden');
      this.elements.panel.classList.remove('flex');
    }

    onContainerKeyUp(event) {
      if (event.code.toUpperCase() !== 'ESCAPE') return;
      this.hidePanel();
      this.elements.button.focus();
    }

    onItemClick(event) {
      const form = event.currentTarget.closest('form');
      if (!form) return;

      this.elements.input.value = event.currentTarget.dataset.value;
      form.submit();
    }

    openSelector() {
      this.elements.button.focus();
      this.elements.panel.classList.remove('hidden');
      this.elements.panel.classList.add('flex');
      this.elements.button.setAttribute(
        'aria-expanded',
        (this.elements.button.getAttribute('aria-expanded') === 'false').toString(),
      );
    }

    closeSelector(event) {
      const shouldClose = event.relatedTarget && event.relatedTarget.nodeName === 'BUTTON';
      if (event.relatedTarget === null || shouldClose) {
        this.hidePanel();
      }
    }
  }

  customElements.define(customElements.component, LocalizationForm);
};