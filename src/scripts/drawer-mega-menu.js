customElements.component = 'mega-menu';

if (!customElements.get(customElements.component)) {
  class MegaMenu extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
      this.activeSection = 'first';
      this.parentTitle = this.dataset.parent;
      this.firstLevel = this.querySelector('.menu-section--first');
      this.secondLevel = this.querySelector('.menu-section--second');
      this.thirdLevel = this.querySelector('.menu-section--third');

      this.handleResize = this.debounce(() => {
        if (window.innerWidth <= 1023 && this.isOpen) {
          this.closeMenu();
        }
      }, 250);
    }

    connectedCallback() {
      this.init();
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this.handleResize);
    }

    init() {
      if (this.secondLevel) {
        this.secondLevel.classList.add('rounded-[0_15px_15px_0]');
      }
      this.setupEventListeners();
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    setupEventListeners() {
      window.addEventListener('resize', this.handleResize);
      document.addEventListener('openMegaMenu', (e) => {
        if (e.detail.parent === this.parentTitle) {
          this.openMenu();
        }
      });

      const megaMenu = this.querySelector('.mega-menu');
      const closeButton = this.querySelector('.close-menu');
      const menuContent = this.querySelector('.mega-menu-content');
      const menuContentBlocks = this.querySelectorAll('.menu-content-block');
      closeButton.addEventListener('click', () => this.closeMenu());

      megaMenu.addEventListener('click', (e) => {
        if (!menuContent.contains(e.target)) {
          this.closeMenu();
        }
      });

      menuContentBlocks.forEach((block) => {
        block.addEventListener('click', (e) => {
          if (!menuContent.contains(e.target)) {
            this.closeMenu();
          }
        });
      });

      this.querySelectorAll('.menu-item--dropdown').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const category = item.dataset.category;
          const brand = item.dataset.brand;

          item.closest('.menu-section').querySelectorAll('.menu-item').forEach(i => {
            i.classList.remove('active');
          });

          item.classList.add('active');

          if (category) this.showSecondLevel(category);
          if (brand) this.showThirdLevel(brand);
        });
      });

      document.addEventListener('keydown', (e) => {
        e.key === 'Escape' && this.handleEscapeKey();
      });

      this.thirdLevel.addEventListener('click', (e) => {
        if (!this.thirdLevel.classList.contains('active')) {
          e.stopPropagation();
          this.closeMenu();
        }
      });
    }

    handleEscapeKey() {
      if (this.thirdLevel.classList.contains('active')) {
        this.hideThirdLevel();
      } else if (this.secondLevel.classList.contains('active')) {
        this.hideSecondLevel();
      } else if (this.isOpen) {
        this.closeMenu();
      }
    }

    showSecondLevel(category) {
      if (this.thirdLevel.classList.contains('active')) this.hideThirdLevel();

      const hasThirdLevel = this.querySelector(`.brands-section[data-for="${category}"] .menu-item--dropdown`);

      if (!hasThirdLevel) {
        requestAnimationFrame(() => {
          this.secondLevel.classList.add('rounded-[0_15px_15px_0]');
        });
      }

      requestAnimationFrame(() => {
        this.secondLevel.classList.add('active');
        this.querySelectorAll('.brands-section').forEach(section => {
          section.classList.remove('active');
        });
        const brandSection = this.querySelector(`.brands-section[data-for="${category}"]`);
        if (brandSection) {
          setTimeout(() => {
            brandSection.classList.add('active');
          }, 30);
        }
      });
    }

    showThirdLevel(brand) {
      this.querySelectorAll('.models-section').forEach(section => {
        section.classList.remove('active');
      });
      this.secondLevel.classList.remove('rounded-[0_15px_15px_0]');
      if (this.thirdLevel.classList.contains('active')) {
        this.querySelectorAll('.models-section').forEach(section => {
          section.style.opacity = '0';
          section.style.transform = 'translateX(0px)';
        });
        setTimeout(() => {
          const modelSection = this.querySelector(`.models-section[data-for="${brand}"]`);
          if (modelSection) {
            modelSection.classList.add('active');
            void modelSection.offsetWidth;
            modelSection.style.opacity = '1';
            modelSection.style.transform = 'translateX(0)';
          }
        }, 200);
      } else {
        requestAnimationFrame(() => {
          this.thirdLevel.classList.add('active');

          setTimeout(() => {
            const modelSection = this.querySelector(`.models-section[data-for="${brand}"]`);
            if (modelSection) {
              modelSection.classList.add('active');
            }
          }, 30);
        });
      }
    }

    hideSecondLevel() {
      this.secondLevel.classList.add('rounded-[0_15px_15px_0]');
      this.secondLevel.classList.remove('active');
      this.hideThirdLevel();
    }

    hideThirdLevel() {
      this.thirdLevel.classList.remove('active');

      this.secondLevel.classList.add('rounded-[0_15px_15px_0]');

      setTimeout(() => {
        this.querySelectorAll('.models-section').forEach(section => {
          section.classList.remove('active');
        });
      }, 200);
    }

    openMenu() {
      const megaMenu = this.querySelector('.mega-menu');
      megaMenu.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';

      this.firstLevel.classList.add('active');
      this.secondLevel.classList.add('rounded-[0_15px_15px_0]');
    }

    closeMenu() {
      this.querySelectorAll('.models-section').forEach(section => {
        section.classList.remove('active');
      });
      this.querySelectorAll('.brands-section').forEach(section => {
        section.classList.remove('active');
      });
      this.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
      });

      if (this.thirdLevel) {
        this.thirdLevel.classList.remove('active');
      }

      if (this.secondLevel) {
        this.secondLevel.classList.add('rounded-[0_15px_15px_0]');
      }

      if (this.thirdLevel.classList.contains('active')) {
        this.thirdLevel.classList.remove('active');
        setTimeout(() => {
          this.secondLevel.classList.remove('active');
          setTimeout(() => {
            this.firstLevel.classList.remove('active');
            this.querySelector('.mega-menu').classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = '';
          }, 200);
        }, 200);
      } else {
        this.secondLevel.classList.remove('active');
        setTimeout(() => {
          this.firstLevel.classList.remove('active');
          this.querySelector('.mega-menu').classList.remove('active');
          this.isOpen = false;
          document.body.style.overflow = '';
        }, 200);
      }
    }
  }

  customElements.define('mega-menu', MegaMenu);
};
