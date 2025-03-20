if (!customElements.get('example-product-card-swatches')) {
  class ExampleProductCardSwatches extends HTMLElement {
    constructor() {
      super();

      this.elements = {
        container: this.querySelector('[data-swatches-container]'),
        swatches: this.querySelectorAll('[data-swatch]')
      };

      this.modificators = {
        active: 'active'
      };

      this.boundHandlers = {
        click: this.handleContainerClick.bind(this),
        keydown: this.handleContainerKeyDown.bind(this)
      };
    }

    connectedCallback() {
      this.init();
    }

    disconnectedCallback() {
      if (this.elements.container) {
        this.elements.container.removeEventListener('click', this.boundHandlers.click);
        this.elements.container.removeEventListener('keydown', this.boundHandlers.keydown);
      }
    }

    init() {
      this.initListeners();
    }

    initListeners() {
      if (this.elements.container) {
        this.elements.container.addEventListener('click', this.boundHandlers.click);
        this.elements.container.addEventListener('keydown', this.boundHandlers.keydown);
      }
    }

    handleContainerKeyDown(event) {
      const swatch = event.target.closest('[data-swatch]');
      if (!swatch) return;

      const swatches = Array.from(this.elements.swatches);
      const currentIndex = swatches.indexOf(swatch);

      switch (event.key) {
        case ' ':
          event.preventDefault();
          this.handleContainerClick(event);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : swatches.length - 1;
          this.focusSwatch(swatches[prevIndex]);
          break;
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = currentIndex < swatches.length - 1 ? currentIndex + 1 : 0;
          this.focusSwatch(swatches[nextIndex]);
          break;
      }
    }

    handleContainerClick(event) {
      const swatch = event.target.closest('[data-swatch]');
      if (!swatch) return;

      const swatchId = swatch.dataset.swatchId;
      const swatchValue = swatch.dataset.swatchValue;
      const activeSwatch = Array.from(this.elements.swatches).find(swatch => swatch.classList.contains(this.modificators.active));
      
      this.toggleTargetClass(activeSwatch, this.modificators.active, false);
      this.toggleTargetClass(swatch, this.modificators.active, true);
      
      if (activeSwatch) {
        activeSwatch.setAttribute('aria-checked', 'false');
      }
      
      swatch.setAttribute('aria-checked', 'true');

      this.dispatchSwatchChangeEvent(swatchId, swatchValue);
    }

    dispatchSwatchChangeEvent(swatchId, swatchValue) {
      this.dispatchEvent(new CustomEvent('swatch:change', {
        detail: { 
          swatchId,
          swatchValue
        },
        bubbles: true
      }));
    }

    focusSwatch(swatch) {
      swatch.focus();
    }

    toggleTargetClass(target, classToToggle, toggler) {
      target && target.classList.toggle(classToToggle, toggler);
    }
  }

  customElements.define('example-product-card-swatches', ExampleProductCardSwatches);
}