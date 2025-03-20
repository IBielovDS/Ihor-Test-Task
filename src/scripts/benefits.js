customElements.component = 'benefits-section';

if (!customElements.get(customElements.component)) {
  class Benefits extends HTMLElement {
    constructor() {
      super();
      this.sectionScrolled = false;
      this.eventAdded = false;
      this.items = this.querySelector('.js-benefit-items');
      this.boundSectionScrollEvent = this.sectionScrollEvent.bind(this);
      this.boundWindowScrollEvent = this.windowScrollEvent.bind(this);
    }

    sectionScrollEvent(event) {
      event.preventDefault();
      this.items.scrollTop += event.deltaY;

      if (this.items.scrollTop + this.items.clientHeight >= this.items.scrollHeight) {
        this.sectionScrolled = true;
        this.removeEventListener('wheel', this.boundSectionScrollEvent);
        window.removeEventListener('scroll', this.boundWindowScrollEvent);
      }
    }

    windowScrollEvent() {
      const rect = this.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!this.sectionScrolled && isVisible) {
        this.addEventListener('wheel', this.boundSectionScrollEvent);
      }
    }

    init() {
      if (window.innerWidth >= 1024 && !this.eventAdded) {
        window.addEventListener('scroll', this.boundWindowScrollEvent);
        this.eventAdded = true;
      }
    }

    connectedCallback() {
      this.init();
      window.addEventListener('resize', this.init.bind(this));
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this.init.bind(this));
      window.removeEventListener('scroll', this.boundWindowScrollEvent);
      this.removeEventListener('wheel', this.boundSectionScrollEvent);
    }
  }

  customElements.define(customElements.component, Benefits);
}