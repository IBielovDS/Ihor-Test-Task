customElements.component = "custom-accordion";

if (!customElements.get(customElements.component)) {
  class CustomAccordion extends HTMLElement {
    constructor() {
      super();
      this.showMoreButton = null;
      this.details = null;
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initSelectors();
      this.initListeners();
    }

    initSelectors() {
      this.showMoreButton = this.querySelector("[data-action='show-more']");
      this.details = this.querySelector("details");
    }

    initListeners() {
      if (this.showMoreButton) {
        this.showMoreButton.addEventListener("click", () =>
          this.toggleTargetClass(this, "show-more", !this.classList.contains("show-more")),
        );
      }

      if (this.details) {
        this.details.addEventListener("click", () => {
          this.toggleTargetClass(this, "show-more", false);
        });
      }
    }

    toggleTargetClass(target, className, isShow) {
      target.classList.toggle(className, isShow);
    }
  }
  customElements.define(customElements.component, CustomAccordion);
}
