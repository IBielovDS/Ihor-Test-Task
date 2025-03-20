customElements.component = "atc-handler";

if (!customElements.get(customElements.component)) {
  class ATCHandler extends HTMLElement {
    constructor() {
      super();
      this.modal = this.closest("custom-modal");
      this.showCartButton = this.querySelector("[data-show-cart]");
      this.continueShoppingButton = this.querySelector("[data-continue-shopping]");
      this.cartModal = this.modal.nextElementSibling;
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initListeners();
    }

    initListeners() {
      document.addEventListener("show-atc-handler", this.showModal.bind(this));
      document.addEventListener("show-card-drawer", () => this.cartModal.handleOpenModal());
      
      if (this.showCartButton) {
        this.showCartButton.addEventListener("click", () => {
          this.closeModal();
          this.cartModal && this.cartModal.handleOpenModal();
        });
      }

      if (this.continueShoppingButton) {
        this.continueShoppingButton.addEventListener("click", () => {
          this.modal.handleCloseModal();
        });
      }
    }

    showModal() {
      if (this.cartModal && this.cartModal.classList.contains("open")) return;
      this.modal.handleOpenModal();
    }

    closeModal() {
      this.modal.handleCloseModal();
    }

    disconectedCallback() {
      document.removeEventListener("show-atc-handler", this.showModal.bind(this));
    }
  }

  customElements.define(customElements.component, ATCHandler);
}
