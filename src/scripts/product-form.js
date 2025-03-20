class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.form = this.querySelector("form");
    this.form.querySelector("[name=id]").disabled = false;
    this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
    this.cart = document.querySelector("side-cart");
    this.submitButton = this.querySelector('[type="submit"]');
    this.submitButton && this.submitButton.addEventListener("click", this.onSubmitHandler.bind(this));
    this.variantSelects = this.form.querySelector('select[name="id"]');
    this.handlerEvent = new CustomEvent("show-atc-handler");
    this.ajaxCart = window.liquidAjaxCart;

    if (this.variantSelects) this.variantSelects.addEventListener("change", this.onVariantChange.bind(this));

    if (document.querySelector("side-cart")) this.submitButton.setAttribute("aria-haspopup", "dialog");

    document.addEventListener("variant:changed", (event) => {
      if (this.form && event.detail.variantId) {
        const idInput = this.form.querySelector('[name="id"]');
        if (idInput) idInput.value = event.detail.variantId;
      }
    });
  }

  onVariantChange(event) {
    const variantId = event.target.value;
    document.dispatchEvent(
      new CustomEvent("variant:changed", {
        detail: { variantId },
      }),
    );
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    if (this.submitButton.getAttribute("aria-disabled") === "true") return;

    this.setButtonLoadingState();
    this.handleErrorMessage();
    // this.submitButton.setAttribute("aria-disabled", true);

    const formData = new FormData(this.form);

    const body = {
      items: [
        {
          id: formData.get("id"),
          quantity: formData.get("quantity"),
        },
      ],
    };

    const options = {
      lastCallback: (requestState) => {
        const data = requestState.responseData;

        if (data.status != 200) {
          this.handleErrorMessage(data.description);
          const soldOutMessage = this.submitButton.querySelector(".sold-out-message");
          if (!soldOutMessage) return;

          this.submitButton.setAttribute("aria-disabled", true);
          this.submitButton.querySelector("span").classList.add("hidden");
          soldOutMessage.classList.remove("hidden");
          this.error = true;
          return;
        }

        this.error = false;
        document.dispatchEvent(this.handlerEvent);

        this.setButtonSuccessState();
        window.closeQuickViewModal && window.closeQuickViewModal();
        setTimeout(() => {
          this.removeButtonLoadingState();
        }, 1000);
      },
      important: false,
    };

    (async () => {
      try {
        await window.liquidAjaxCart.add(body, options);
      } catch (e) {
        window.closeQuickViewModal && window.closeQuickViewModal();
        this.removeButtonLoadingState();
        console.error(e);
        if (this.cart && this.cart.classList.contains("is-empty")) {
          this.cart.classList.remove("is-empty");
        }
        if (!this.error) {
          this.submitButton.removeAttribute("aria-disabled");
        }
      }
    })();
  }

  handleErrorMessage(errorMessage = false) {
    const errorMessageWrapper = this.querySelector(".product-form__error-message-wrapper");
    if (!errorMessageWrapper) return;

    const errorMessageElement = errorMessageWrapper.querySelector(".product-form__error-message");
    errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

    if (errorMessage) {
      errorMessageElement.textContent = errorMessage;
    }
  }

  setButtonLoadingState() {
    this.toggleTargetClass(this.submitButton, "is-loading", true);
    this.toggleTargetClass(this.submitButton, "is-success", false);
  }

  setButtonSuccessState() {
    this.toggleTargetClass(this.submitButton, "is-success", true);
  }

  removeButtonLoadingState() {
    this.toggleTargetClass(this.submitButton, "is-loading", false);
    this.toggleTargetClass(this.submitButton, "is-success", false);
  }

  toggleTargetClass(target, className, flag) {
    target.classList.toggle(className, flag);
  }
}

if (!customElements.get("product-form")) {
  customElements.define("product-form", ProductForm);
}
