export class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.plusButton = this.querySelector('button[name="plus"]');
    this.minusButton = this.querySelector('button[name="minus"]');

    this.plusButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.updateQuantity("plus");
    });

    this.minusButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.updateQuantity("minus");
    });
  }

  updateQuantity(action) {
    const previousValue = this.input.value;

    if (action === "plus") {
      this.input.stepUp();
    } else if (action === "minus") {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }
}
if (!customElements.get("quantity-input")) {
  customElements.define("quantity-input", QuantityInput);
}

export default QuantityInput;
