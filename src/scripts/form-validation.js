customElements.component = "form-validation";

if (!customElements.get(customElements.component)) {
  class FormValidation extends HTMLElement {
    constructor() {
      super();
      this.form = null;
      this.isValidForm = true;
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initSelectors();
      this.initListeners();
      this.checkHashState();
    }

    initSelectors() {
      this.formType = this.getAttribute("data-form-type");
      this.form = this.querySelector("form");
      this.sumbit = this.querySelector("[type='submit']");
      this.inputs = this.querySelectorAll("input");
      this.textareas = this.querySelectorAll("textarea");
      this.selects = this.querySelectorAll("select");
      this.elements = [...this.inputs, ...this.textareas, ...this.selects];
      this.showPasswordButtons = this.querySelectorAll("[data-show-password]");
      this.hideDefaultErrors = this.querySelectorAll("[data-hide-default-error]");
    }

    initListeners() {
      if (!this.form) return;

      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.validateForm();
      });

      this.sumbit.addEventListener("submit", (event) => {
        event.preventDefault();
        this.validateForm();
      });

      this.sumbit.addEventListener("click", (event) => {
        event.preventDefault();
        this.validateForm();
      });

      if (this.elements.length) {
        this.elements.forEach((element) => {
          const wrapper = element.closest(".input-wrapper");

          if (!wrapper) return;

          element.addEventListener("input", () => {
            this.toggleTargetClass(wrapper, "error", false);
          });

          element.addEventListener("change", () => {
            this.toggleTargetClass(wrapper, "error", false);
          });
        });
      }

      if (this.showPasswordButtons.length) {
        this.showPasswordButtons.forEach((button) => {
          const wrapper = button.closest(".input-wrapper");
          const input = wrapper.querySelector("input[type='password']");
          button.addEventListener("click", () => {
            this.togglePasswordVisibility(input, button);
          });
        });
      }

      if (this.hideDefaultErrors.length) {
        this.hideDefaultErrors.forEach((button) => {
          button.addEventListener("click", () => {
            const wrapper = button.closest("li");

            this.toggleTargetClass(wrapper, "hidden", true);
          });
        });
      }

      window.addEventListener("hashchange", () => this.checkHashState());
    }

    checkHashState() {
      if (window.location.hash === "#recover") {
        this.formType === "recover" && this.toggleTargetClass(this, "show", true);
        this.formType === "login" && this.toggleTargetClass(this, "hide", true);
      } else if (window.location.hash === "#recover-success") {
        this.formType === "login" && this.toggleTargetClass(this, "recover-success", true);
        this.formType === "recover" && this.toggleTargetClass(this, "show", false);
      }
    }

    validateForm() {
      this.toggleTargetClass(this.form, "loading", true);
      this.toggleTargetClass(this.sumbit, "is-loading", true);
      this.elements.forEach((element) => {
        const wrapper = element.closest(".input-wrapper");

        if (!wrapper) return;

        this.toggleTargetClass(wrapper, "error", !element.checkValidity());
        this.isValidForm = element.checkValidity();
      });

      this.form.checkValidity() ? this.form.submit() : this.toggleTargetClass(this.sumbit, "is-loading", false);
      this.toggleTargetClass(this.form, "loading", false);
    }

    togglePasswordVisibility(input, button) {
      const type = input.getAttribute("type") === "password" ? "text" : "password";

      input.setAttribute("type", type);
      this.toggleTargetClass(button, "show", input.getAttribute("type") === "text");
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }
  }
  customElements.define(customElements.component, FormValidation);
}
