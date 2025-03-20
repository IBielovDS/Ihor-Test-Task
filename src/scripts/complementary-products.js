customElements.component = "complementary-products";

if (!customElements.get(customElements.component)) {
  class ComplementaryProducts extends HTMLElement {
    constructor() {
      super();
      this.productCards = this.querySelectorAll("complementary-product-card");
      this.checkboxButtons = this.querySelectorAll(".complementary-product-card__checkbox");
      this.totalPriceElement = this.querySelector(".total-price");
      this.compareAtPriceElement = this.querySelector(".compare-at-price");
      this.addToCartButton = this.querySelector("button.button--primary");
      this.addToCartText = this.addToCartButton?.querySelector("span");
      this.oneItemText = this.dataset.oneItem;
      this.originalButtonText = this.dataset.originalText;
      this.selectedProducts = new Set();
      this.initialSelection();
    }

    initialSelection() {
      this.productCards.forEach((card) => {
        this.selectedProducts[card.classList.contains("is-checked") ? "add" : "delete"](card.dataset.variantId);
      });
      this.updateTotalPrice();
      this.updateButtonState();
    }

    calculateTotalPrice() {
      let totalPrice = 0;
      let totalComparePrice = 0;

      this.productCards.forEach((card) => {
        if (this.selectedProducts.has(card.dataset.variantId)) {
          const priceText = card.querySelector(".product-card__bottom__meta-price-main").dataset.price;
          const price = Number(priceText);
          totalPrice += price / 100;
          totalPrice = totalPrice;

          const compareElement = card.querySelector(".product-card__bottom__meta-price-compare");
          if (compareElement) {
            const compareText = compareElement.textContent;
            const comparePrice = parseFloat(compareText.replace(/[^0-9.]/g, ""));
            totalComparePrice += comparePrice;
          }
        }
      });

      return { totalPrice, totalComparePrice };
    }

    updateTotalPrice() {
      const { totalPrice, totalComparePrice } = this.calculateTotalPrice();

      this.totalPriceElement.textContent = `${window.currentCurrency}${totalPrice.toFixed(2)}`;
      if (totalComparePrice > totalPrice) {
        this.compareAtPriceElement.textContent = `${window.currentCurrency}${totalComparePrice.toFixed(2)}`;
        this.compareAtPriceElement.style.display = "block";
      } else {
        this.compareAtPriceElement.style.display = "none";
      }
    }

    updateButtonState() {
      const selectedCount = this.selectedProducts.size;

      this.addToCartButton.disabled = selectedCount === 0;
      this.addToCartButton.classList.toggle("opacity-50", selectedCount === 0);

      if (this.addToCartText) {
        if (selectedCount === 1 && this.oneItemText) {
          this.addToCartText.textContent = this.oneItemText;
        } else if (selectedCount > 0) {
          let newText = this.originalButtonText;
          newText = newText.replace("[x]", selectedCount.toString());
          this.addToCartText.textContent = newText;
        }
      }
    }

    toggleProduct(card) {
      const variantId = card.dataset.variantId;

      const hasVariant = this.selectedProducts.has(variantId);
      this.selectedProducts[hasVariant ? "delete" : "add"](variantId);
      card.classList.toggle("is-checked", !hasVariant);

      this.updateTotalPrice();
      this.updateButtonState();
    }

    async addToCart() {
      if (this.selectedProducts.size === 0) return;

      try {
        this.setButtonLoadingState();
        const items = Array.from(this.selectedProducts).map((id) => ({
          id: parseInt(id),
          quantity: 1,
        }));

        const body = {
          items,
        };

        const options = {
          lastCallback: () => {
            document.dispatchEvent(new CustomEvent("cart:refresh"));
            document.dispatchEvent(new CustomEvent("show-card-drawer"));
            this.setButtonSuccessState();
            setTimeout(() => {
              this.removeButtonLoadingState();
            }, 1000);
          },
        };

        await window.liquidAjaxCart.add(body, options);
      } catch (error) {
        this.removeButtonLoadingState();
        console.error("Error adding products to cart:", error);
      }
    }

    addEventListener() {
      this.checkboxButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const card = button.closest("complementary-product-card");
          this.toggleProduct(card);
        });
      });

      this.addToCartButton.addEventListener("click", () => this.addToCart());
    }

    setButtonLoadingState() {
      this.toggleTargetClass(this.addToCartButton, "is-loading", true);
      this.toggleTargetClass(this.addToCartButton, "is-success", false);
    }

    setButtonSuccessState() {
      this.toggleTargetClass(this.addToCartButton, "is-success", true);
    }

    removeButtonLoadingState() {
      this.toggleTargetClass(this.addToCartButton, "is-loading", false);
      this.toggleTargetClass(this.addToCartButton, "is-success", false);
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }

    connectedCallback() {
      this.addEventListener();
    }
  }

  customElements.define(customElements.component, ComplementaryProducts);
}
