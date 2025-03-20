customElements.component = 'section-header';

if (!customElements.get(customElements.component)) {
  class Header extends HTMLElement {
    constructor() {
      super();
      this.html = document.querySelector('html');
      this.mobileMenuHeight = 0;
      this.mobileMenuTrigger = this.querySelector('.js-mobile-menu-trigger');
      this.mobileMenuClose = this.querySelector('.js-mobile-menu-close');
      this.mobileMenu = this.querySelector('.js-mobile-menu');
      this.mobileItemWithChild = this.querySelectorAll('.js-menu-item-has-child');
      this.mobileItemChild = this.querySelectorAll('.js-menu-item-child');
      this.mobileMenuBackBtn = this.querySelectorAll('.js-menu-item-back');
    }

    setMobileMenuHeight(setNow = false) {
      // Arg 'setNow' will be used in future when we need to set the height of mobile menu immediately, for ex. when user scroll the page and header height is changed
      this.headerHeight = 0;
      this.announcementBarsHeight = 0;
      this.announcementBars = document.querySelectorAll('.js-announcement-bar-section');
      this.header = this.closest('.js-header-section');

      this.header && (this.headerHeight = this.header.getBoundingClientRect().height);
      this.announcementBars && this.announcementBars.forEach(bar => {
        this.announcementBarsHeight += bar.getBoundingClientRect().height;
      });

      const mobileMenuHeight = `calc(100vh - ${this.announcementBarsHeight + this.headerHeight}px)`;
      this.mobileMenuHeight = mobileMenuHeight;

      if (setNow) {
        this.mobileMenu.style.height = mobileMenuHeight;
      }
    }

    handleCloseMenu() {
      this.mobileMenu.style.height = 0;
      this.toggleClasses();
    }

    handleOpenMenu() {
      this.mobileMenu.style.height = this.mobileMenuHeight;
      this.toggleClasses();
    }

    toggleClasses() {
      this.html.classList.toggle('overflow-hidden');
      this.mobileMenuClose.classList.toggle('opacity-0');
      this.mobileMenuTrigger.classList.toggle('z-10');
      this.mobileMenuTrigger.classList.toggle('opacity-0');
    }

    handleClickItemWithChild(item) {
      const child = item.closest('.js-menu-item-has-child-wrap').querySelector('.js-menu-item-child');

      if (child) child.style.transform = 'translateX(0)';
    }

    handleClickBackBtn(el) {
      const parent = el.closest('.js-menu-item-child');
      
      if (parent) parent.style.transform = 'translateX(-100%)';
    };

    addEventListeners() {
      this.mobileMenuTrigger && this.mobileMenuTrigger.addEventListener('click', this.handleOpenMenu.bind(this));
      this.mobileMenuClose && this.mobileMenuClose.addEventListener('click', this.handleCloseMenu.bind(this));

      this.mobileItemWithChild && this.mobileItemWithChild.forEach(item => item.addEventListener('click', () => this.handleClickItemWithChild(item)));
      this.mobileMenuBackBtn && this.mobileMenuBackBtn.forEach(btn => btn.addEventListener('click', () => this.handleClickBackBtn(btn)));
    }

    init() {
      this.setMobileMenuHeight();
      this.addEventListeners();
    }

    connectedCallback() {
      this.init();
    }
  }

  customElements.define(customElements.component, Header);
};