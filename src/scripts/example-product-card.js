if (!customElements.get('example-product-card')) {
  class ExampleProductCard extends HTMLElement {
    constructor() {
      super();
      
      this.elements = {
        imageContainer: this.querySelector('[data-product-card-image-container]'),
        priceContainer: this.querySelector('[data-product-card-price]'),
        variantTemplate: this.querySelector('[data-variant-template]'),
        badgeContainer: this.querySelector('[data-product-card-badges]'),
        links: this.querySelectorAll('[data-product-card-link]')
      };

      this.modificators = {
        hidden: 'hidden'
      };
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initListeners();
      this.updateBadgeVisibility();
    }

    initListeners() {
      this.addEventListener('swatch:change', this.handleSwatchChange.bind(this));
    }

    updateBadgeVisibility() {
      if (this.elements.badgeContainer) {
        const hasBadges = this.elements.badgeContainer.innerHTML.trim() !== '';
        this.elements.badgeContainer.classList.toggle(this.modificators.hidden, !hasBadges);
      }
    }

    handleSwatchChange(event) {
      const { swatchId } = event.detail;
      const variantItem = this.elements.variantTemplate.content.querySelector(`[data-variant-item="${swatchId}"]`);
      
      if (!variantItem) return;

      this.updateImages(variantItem);
      this.updatePrice(variantItem);
      this.updateUrls(variantItem);
      this.updateBadges(variantItem);
    }

    updateImages(variantItem) {
      const imageContent = variantItem.querySelector('[data-variant-images]');
      if (imageContent && this.elements.imageContainer) {
        this.elements.imageContainer.innerHTML = imageContent.innerHTML;
      }
    }

    updatePrice(variantItem) {
      const priceContent = variantItem.querySelector('[data-variant-price-content]');
      if (priceContent && this.elements.priceContainer) {
        this.elements.priceContainer.innerHTML = priceContent.innerHTML;
        this.elements.priceContainer.setAttribute('aria-label', priceContent.getAttribute('aria-label'));
      }
    }

    updateUrls(variantItem) {
      const urlContent = variantItem.querySelector('[data-variant-url-content]');
      if (urlContent && this.elements.links.length > 0) {
        const newUrl = urlContent.textContent.trim();
        this.elements.links.forEach(link => {
          link.href = newUrl;
        });
      }
    }

    updateBadges(variantItem) {
      if (this.elements.badgeContainer) {
        const badgeContent = variantItem.querySelector('[data-variant-badges-content]');
        this.elements.badgeContainer.innerHTML = badgeContent ? badgeContent.innerHTML : '';
        this.updateBadgeVisibility();
      }
    }

    disconnectedCallback() {
      this.removeEventListener('swatch:change', this.handleSwatchChange.bind(this));
    }

    toggleTargetClass(target, classToToggle, toggler) {
      target && target.classList.toggle(classToToggle, toggler);
    }
  }

  customElements.define('example-product-card', ExampleProductCard);
}