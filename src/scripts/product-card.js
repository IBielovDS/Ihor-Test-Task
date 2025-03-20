customElements.component = "product-card";

if (!customElements.get(customElements.component)) {
  class ProductCard extends HTMLElement {
    constructor() {
      super();

      this.mainImages = this.querySelectorAll('.product-card__image');
      this.price = this.querySelector('.product-card__bottom__meta-price-main');
      this.priceCompare = this.querySelector('.product-card__bottom__meta-price-compare');
      this.links = this.querySelectorAll('.js-product-card-link');
      this.quickViewBtn = this.querySelector('.js-quick-view-btn');
      this.addToCartBtn = this.querySelector('.js-add-to-cart-btn')
      this.swatches = this.querySelectorAll('.js-swatch-color');
      this.product = JSON.parse(this.dataset.product);
      this.srcsetSizes = [
        10, 20, 30, 40, 50, 75, 100, 150, 200, 250, 320, 480, 576, 768, 992, 1024, 1220, 1440, 1680, 1920, 2000, 2180,
      ];
    }

    handleToggleVariant(swatch) {
      this.classList.toggle("is-card-loading", true);
      this.swatches.forEach((swatch) => swatch.classList.toggle("active", false));
      swatch.classList.toggle("active", true);

      const variant = JSON.parse(swatch.dataset.variant);

      const variantImageId = variant.featured_media.id;
      let nextIndex = 0;

      this.product.media.forEach((media) => {
        if (media.id === variantImageId) {
          this.mainImages[0].src = media.src;
          this.mainImages[0].srcset = this.generateSrcset(media.src, media.width);
          this.mainImages[0].alt = media.alt;
          nextIndex = media.position + 1;
        }
      });

      const nextImage = this.product.media[nextIndex];

      if (this.mainImages[1]) {
        this.mainImages[1].src = nextImage.src;
        this.mainImages[1].srcset = this.generateSrcset(nextImage.src, nextImage.width);
      }

      this.links.forEach((link) => link.setAttribute("href", `/products/${this.product.handle}?variant=${variant.id}`));

      this.quickViewBtn &&
        this.quickViewBtn.setAttribute("data-url", `/products/${this.product.handle}?variant=${variant.id}`);

      if (this.addToCartBtn) {
        if (variant.available) {
          this.addToCartBtn.classList.toggle('hidden', false);
          this.addToCartBtn.setAttribute('data-variant-id', variant.id);
        } else {
          this.addToCartBtn.classList.toggle('hidden', true);
        }
      }

      this.price.innerHTML = this.formatPrice(variant.price);

      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        this.priceCompare.innerHTML = this.formatPrice(variant.compare_at_price);
        this.priceCompare.classList.toggle("hidden", false);
      } else {
        this.priceCompare.classList.toggle("hidden", true);
      }

      this.classList.toggle("is-card-loading", false);
    }

    generateSrcset(imageUrl, imageWidth) {
      let srcsetString = "";

      this.srcsetSizes.forEach((size, index) => {
        if (size <= imageWidth) {
          const resizedUrl = imageUrl.replace(/(\.[^.]*)$/, `_${size}x$1`);
          srcsetString += `${resizedUrl} ${size}w${index !== this.srcsetSizes.length - 1 ? ", " : ""}`;
        }
      });

      return srcsetString;
    }

    formatPrice(price) {
      return `${window.currentCurrency}${(price / 100).toFixed(2)}`;
    }

    async handleAddToCart() {
      const variantID = this.addToCartBtn.getAttribute('data-variant-id');
      const body = {
        id: variantID,
        quantity: 1
      }

      const options = {
        lastCallback: () => {
          this.addToCartBtn.classList.toggle('loading', false);
          this.addToCartBtn.classList.toggle('button--disabled', false);
          this.addToCartBtn.classList.toggle('done', true);
          document.dispatchEvent(new CustomEvent("cart:refresh"));
          document.dispatchEvent(new CustomEvent("show-atc-handler"));

          setTimeout(() => {
            this.addToCartBtn.classList.toggle('done', false);
          }, 3000);
        },
      };

      this.addToCartBtn.classList.toggle('loading', true);
      this.addToCartBtn.classList.toggle('button--disabled', true);

      await window.liquidAjaxCart.add(body, options);
    }

    addEventListeners() {
      this.swatches && this.swatches.forEach(swatch => swatch.addEventListener('click', this.handleToggleVariant.bind(this, swatch)));
      this.addToCartBtn && this.addToCartBtn.addEventListener('click', this.handleAddToCart.bind(this));
    }

    removeEventListeners() {
      this.swatches &&
        this.swatches.forEach((swatch) =>
          swatch.removeEventListener("click", this.handleToggleVariant.bind(this, swatch)),
        );
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define(customElements.component, ProductCard);
}
