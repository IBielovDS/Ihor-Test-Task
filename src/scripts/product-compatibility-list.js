customElements.component = 'product-compatibility-list';

if (!customElements.get(customElements.component)) {
  class ProductCompatibilityList extends HTMLElement {
    constructor() {
      super();
      this.tabItems = this.querySelectorAll('.js-tab-item');
      this.tabContents = this.querySelectorAll('.js-tab-content');
    }

    addEventListeners() {
      this.tabItems.forEach((tabItem, index) => {
        tabItem.addEventListener('click', () => {
          this.tabItems.forEach((tabItem) => {
            tabItem.classList.remove('active');
          });
          this.tabContents.forEach((tabContent) => {
            tabContent.classList.add('hidden');
          });
          tabItem.classList.add('active');
          this.tabContents[index].classList.remove('hidden');
        })
      });
    }

    connectedCallback() {
      this.addEventListeners();
    }
  }

  customElements.define(customElements.component, ProductCompatibilityList);
};