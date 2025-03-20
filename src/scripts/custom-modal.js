customElements.component = "custom-modal";

if (!customElements.get(customElements.component)) {
  class CustomModal extends HTMLElement {
    constructor() {
      super();
      this.modal = this;
      this.trigger = document.querySelector(this.dataset["trigger"]);
      this.close = this.dataset["close_trigger"]
        ? document.querySelector(this.dataset["close_trigger"])
        : this.querySelector(".modal__close");
      this.inner = this.querySelector(".modal__inner");
      this.html = document.querySelector("html");
      this.id = this.dataset["id"];
      this.open = this.classList.contains("open");
      this.open && this.handleOpenModal();

      if (this.closeTrigger) {
        this.close && this.close.classList.add("hidden");
        this.close = document.querySelector(this.closeTrigger);
      }
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }

    handleClickOutside(e) {
      if (!this.inner.contains(e.target)) {
        this.handleCloseModal();
      }
    }

    handleOpenModal() {
      this.toggleTargetClass(this.modal, "open", true);
      this.toggleTargetClass(this.html, "locked", true);
    }

    handleCloseModal() {
      if (this.classList.contains("loading")) return;

      this.toggleTargetClass(this.modal, "open", false);
      this.toggleTargetClass(this.html, "locked", false);
      document.body.style.overflow = "auto";
    }

    addEventListeners() {
      this.modal.addEventListener("click", this.handleClickOutside.bind(this));
      this.trigger &&
        this.trigger.addEventListener("click", (event) => {
          event.preventDefault();
          this.handleOpenModal();
        });
      this.close && this.close.addEventListener("click", this.handleCloseModal.bind(this));
    }

    removeEventListeners() {
      this.trigger && this.trigger.removeEventListener("click", this.handleOpenModal.bind(this));
      this.close && this.close.removeEventListener("click", this.handleCloseModal.bind(this));
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define(customElements.component, CustomModal);
}
