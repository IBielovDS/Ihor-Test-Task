if (!customElements.get('related-products-grid')) {
  class RelatedProductsGrid extends HTMLElement {
    constructor() {
      super();
      this.id = null;
    }
  
    connectedCallback() {
      init();
    }

    init() {
      this.id = this.dataset.sectionId;
      this.getProducts();
    }

    getProducts = () => {
      const url = this.dataset.url;
      fetch(url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector(`related-products-grid[data-section-id="${this.id}"]`);

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }
        })
        .catch(e => {
          console.error(e);
        });
    }
  }

  customElements.define('related-products-grid', RelatedProductsGrid);

  document.addEventListener('shopify:section:load', (event)=>{
    if (event.target.querySelector('related-products-grid')) {
      event.target.querySelector('related-products-grid').init()
    }
  })
}