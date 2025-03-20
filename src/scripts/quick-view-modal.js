customElements.component = "quick-view-modal";

if (!customElements.get(customElements.component)) {
  class QuickViewModal extends HTMLElement {
    constructor() {
      super();
      this.html = document.querySelector("html");
      this.inner = this.querySelector(".modal__inner");
      this.modalContent = this.querySelector(".js-quick-view-modal-content");
      this.modalClose = this.querySelector(".js-quick-view-modal-close");

      window.openQuickViewModal = (url) => this.handleOpenModal(url);
      window.closeQuickViewModal = this.handleCloseModal.bind(this);
    }

    handleOpenModal(url) {
      this.html.classList.toggle("overflow-hidden", true);
      this.classList.toggle("open", true);
      this.fetchData(url);
    }

    handleCloseModal() {
      this.html.classList.toggle("overflow-hidden", false);
      this.classList.toggle("open", false);
      this.renderLoader();
    }

    handleClickOutside(e) {
      if (!this.inner.contains(e.target)) {
        this.handleCloseModal();
      }
    }

    async fetchData(url) {
      const req = await fetch(`${url}${url.includes("?") ? "&" : "?"}view=ajax`);
      const res = await req.text();
      const html = new DOMParser().parseFromString(res, "text/html");
      const content = html.querySelector(".js-main-product-section");

      content ? this.renderProduct(content.innerHTML) : this.renderLoader();
    }

    initFancybox() {
      this.fancyBoxElms = this.modalContent.querySelectorAll("[data-fancybox]");
      if (this.fancyBoxElms.length) Fancybox.bind("[data-fancybox]");
    }

    renderProduct(html) {
      this.modalContent.innerHTML = html;
      this.modalContent.classList.remove("loading-spinner");
      this.initFancybox();
    }

    renderLoader() {
      this.modalContent.innerHTML = `<div class="loader-wrap visible"><div class="loader visible"></div></div>`;
      this.modalContent.classList.add("loading-spinner");
    }

    addEventListeners() {
      this.addEventListener("click", this.handleClickOutside.bind(this));
      this.modalClose.addEventListener("click", this.handleCloseModal.bind(this));
    }

    removeEventListeners() {
      this.removeEventListener("click", this.handleClickOutside.bind(this));
      this.modalClose.removeEventListener("click", this.handleCloseModal.bind(this));
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define(customElements.component, QuickViewModal);
}
