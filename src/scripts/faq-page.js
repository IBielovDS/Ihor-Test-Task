customElements.component = "faq-page";

if (!customElements.get(customElements.component)) {
  class FaqPage extends HTMLElement {
    constructor() {
      super();
      
      this.tabs = this.querySelectorAll(".js-faq-tab");
      this.tabContents = this.querySelectorAll(".js-faq-tab-content");
    }

    handleSwitchTab(handle) {
      this.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === handle));
      this.tabContents && this.tabContents.forEach(tabContents => tabContents.classList.toggle('hidden', tabContents.dataset.tab !== handle));
    }

    addEventListeners() {
      this.tabs && this.tabs.forEach(tab => {
        const handle = tab.dataset['tab'];
        tab.addEventListener('click', () => this.handleSwitchTab(handle));
      });
    }

    removeEventListeners() {
      this.tabs && this.tabs.forEach(tab => {
        const handle = tab.dataset['tab'];
        tab.removeEventListener('click', () => this.handleSwitchTab(handle));
      });
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define(customElements.component, FaqPage);
}