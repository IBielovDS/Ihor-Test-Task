customElements.component = "reorder-button";

if (!customElements.get(customElements.component)) {
  class ReorderButton extends HTMLElement {
    constructor() {
      super();
      this.variantIds = this.getAttribute("data-variant-ids").split(",").map((id) => id.trim());
      this.quantities = this.getAttribute("data-variant-quantities").split(",").map((qty) => parseInt(qty.trim()));
      this.inventories = this.getAttribute("data-variant-inventories").split(",").map((inv) => parseInt(inv.trim()));
      this.inventoryPolicies = this.getAttribute("data-variant-inventory-policies").split(",").map((policy) => policy.trim());
      this.inventoryTrackers = this.getAttribute("data-variant-inventory-trackers").split(",").map((tracker) => tracker.trim());
    }

    addEventListeners() {
      this.addEventListener("click", this.handleReorder.bind(this));
    }

    removeEventListeners() {
      this.removeEventListener("click", this.handleReorder.bind(this));
    }

    async handleReorder() {
      for (let i = 0; i < this.variantIds.length; i++) {
        if (isNaN(this.quantities[i]) || !this.variantIds[i]) {
          continue;
        }
        await this.addToCart(this.variantIds[i], this.quantities[i]);
      }

      document.querySelector(".js-header-cart").click();
    }

    async addToCart(variantId, quantity) {
      const body = {
        items: [
          {
            id: variantId,
            quantity: quantity,
          },
        ],
      };

      try {
        await window.liquidAjaxCart.add(body);
      } catch (error) {
        console.error("Error adding product to cart:", error);
      }
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define("reorder-button", ReorderButton);
}
