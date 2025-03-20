customElements.component = 'section-footer';

if (!customElements.get(customElements.component)) {
  class Footer extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        navItem: ".js-footer-nav-item",
        navTitle: ".js-footer-nav-title",
      };

      this.navItems = this.querySelectorAll(this.selectors.navItem);

      this.navItems && this.navItems.forEach(item => {
        const itemTitle = item.querySelector(this.selectors.navTitle);
        
        itemTitle.addEventListener('click', () => {
          item.classList.toggle('opened');
        });
      })
    }
  }

  customElements.define(customElements.component, Footer);
};