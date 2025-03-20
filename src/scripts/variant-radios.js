export class VariantSelect extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
    this.productFormId = this.dataset.productFormId;

    document.addEventListener("variant:changed", (event) => {
      if (event.target !== this) {
        this.updateFromExternalChange(event.detail);
      }
    });
  }

  connectedCallback() {
    this.updateOptions();
    this.updateMasterId();
  }

  onVariantChange(event) {
    this.updateTitle(event.target);
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.removeErrorMessage();
    this.updateViewMoreButton();

    this.dispatchVariantChangeEvent();

    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateURL();
      this.renderProductInfo();
    }
  }

  updateViewMoreButton() {
    this.viewMoreButton = document.querySelector(".js-view-details");
    if (!this.viewMoreButton) return;

    this.viewMoreButton.setAttribute("href", `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateTitle(target) {
    const valueLabel = target.closest(".product-form__input")?.querySelector(".form__selected-value");
    if (valueLabel) {
      valueLabel.innerHTML = target.value;
    }
  }

  updateOptions() {
    const selects = Array.from(this.querySelectorAll("select"));
    if (selects.length) {
      this.options = selects.map((select) => select.value);
    } else {
      const fieldsets = Array.from(this.querySelectorAll("fieldset"));
      this.options = fieldsets.map((fieldset) => {
        const radio = Array.from(fieldset.querySelectorAll("input")).find((radio) => radio.checked);
        return radio.value;
      });
    }
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find(
      (variant) => !variant.options.map((option, index) => this.options[index] === option).includes(false),
    );
  }

  updateFormData(variant) {
    const formId = document.getElementById(`${this.productFormId}`).querySelector('input[name="id"]');
    if (variant.available) {
      formId.value = variant.id;
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false" || !window.location.pathname.includes("/products/"))
      return;
    window.history.replaceState({}, "", `${this.dataset.url}?variant=${this.currentVariant.id}`);
    this.updateFormData(this.currentVariant);
  }

  removeErrorMessage() {
    const section = this.closest("section");
    if (!section) return;

    const productForm = section.querySelector("product-form");
    if (productForm) productForm.handleErrorMessage();
  }

  async renderProductInfo() {
    try {
      const response = await fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&view=ajax`);
      const responseText = await response.text();
      const html = new DOMParser().parseFromString(responseText, "text/html");

      const destinations = document.querySelectorAll('.price_block');
      const source = html.querySelector('.price_block');

      if (source && destinations.length) {
        destinations.forEach((destination) => {
          destination.innerHTML = source.innerHTML;
        });
      }

      const price = document.getElementById(`price-${this.dataset.section}`);

      if (price) {
        price.classList.remove("invisible");
      }

      this.toggleAddButton(window.variantStrings.soldOut, !this.currentVariant.available);
    } catch (error) {
      console.error("Error rendering product info:", error);
    }
  }

  toggleAddButton(text, disable = true) {
    const productForms = document.querySelectorAll('.product-form');
    if (!productForms) return;

    productForms.forEach((productForm) => {
      const addButton = productForm.querySelector('[name="add"]');
      if (!addButton) return;

      if (disable) {
        addButton.setAttribute("disabled", "disabled");
        if (text) addButton.textContent = text;
      } else {
        addButton.removeAttribute("disabled");
        addButton.textContent = window.variantStrings.addToCart;
      }
    });
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add("invisible");
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  updateFromExternalChange(detail) {
    if (!detail) return;
    const { variantId, options } = detail;

    if (!options) return;

    const selects = Array.from(this.querySelectorAll("select"));
    if (selects.length) {
      selects.forEach((select, index) => {
        if (options[index] !== undefined) {
          select.value = options[index];
        }
      });
    }

    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    fieldsets.forEach((fieldset, index) => {
      if (options[index] !== undefined) {
        const radio = fieldset.querySelector(`input[value="${options[index]}"]`);
        if (radio) {
          radio.checked = true;
        }
      }
    });

    const checkedElement = this.querySelector("input:checked, select");
    if (checkedElement) {
      this.updateTitle(checkedElement);
    }
    this.updateOptions();
    this.updateMasterId();
    this.updateURL();
    this.renderProductInfo();
  }

  dispatchVariantChangeEvent() {
    if (!this.currentVariant) return;

    const variantChangeEvent = new CustomEvent("variant:changed", {
      detail: {
        variantId: this.currentVariant.id,
        options: this.options,
      },
      bubbles: true,
    });
    this.dispatchEvent(variantChangeEvent);
  }
}

if (!customElements.get("variant-selects")) {
  customElements.define("variant-selects", VariantSelect);
}

class VariantRadios extends VariantSelect {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
  }

  connectedCallback() {
    super.connectedCallback();

    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    const selects = Array.from(this.querySelectorAll("select"));

    setTimeout(() => {
      if (selects.length) {
        const initialSelect = selects[0];
        const variantChangeEvent = new CustomEvent("variant:changed", {
          detail: {
            color: initialSelect.value,
          },
          bubbles: true,
        });
        document.dispatchEvent(variantChangeEvent);
      } else if (fieldsets.length) {
        const initialRadio = fieldsets[0].querySelector("input:checked");
        if (initialRadio) {
          const variantChangeEvent = new CustomEvent("variant:changed", {
            detail: {
              color: initialRadio.value,
            },
            bubbles: true,
          });
          document.dispatchEvent(variantChangeEvent);
        }
      }
    }, 500);
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    const selects = Array.from(this.querySelectorAll("select"));

    if (selects.length) {
      this.options = selects
        .map((select) => {
          if (!select || !select.value) return null;

          const variantChangeEvent = new CustomEvent("variant:changed", {
            detail: {
              color: select.value,
            },
            bubbles: true,
          });
          document.dispatchEvent(variantChangeEvent);

          return select.value;
        })
        .filter(Boolean);
    } else {
      this.options = fieldsets
        .map((fieldset) => {
          const radio = Array.from(fieldset.querySelectorAll("input")).find((radio) => radio.checked);

          if (radio && radio.value) {
            const variantChangeEvent = new CustomEvent("variant:changed", {
              detail: {
                color: radio.value,
              },
              bubbles: true,
            });
            document.dispatchEvent(variantChangeEvent);

            return radio.value;
          }
          return null;
        })
        .filter(Boolean);
    }
  }
}

if (!customElements.get("variant-radios")) {
  customElements.define("variant-radios", VariantRadios);
}
