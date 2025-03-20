customElements.component = "video-tutorials";

if (!customElements.get(customElements.component)) {
  class VideoTutorials extends HTMLElement {
    constructor() {
      super();

      this.html = document.querySelector('html');
      this.tabs = this.querySelectorAll(".js-video-tutorials-tab");
      this.tabContents = this.querySelectorAll(".js-video-tutorials-tab-content");
      this.letters = this.querySelectorAll(".js-letter");
      this.lettersWrap = this.querySelectorAll(".js-letters-wrap");
      this.lettersWrapOffsetTop = this.lettersWrap ? this.lettersWrap[0].offsetTop : 0;
      this.fancyBoxElms = this.querySelectorAll('[data-fancybox]');
      this.headerHeight = 0;
    }

    calculatePosition() {
      this.header = document.querySelector('.js-header-section');
      this.header && (this.headerHeight = this.header.getBoundingClientRect().height);

      const blockTopPosition = `${this.headerHeight}px`;

      this.html.style.scrollPaddingTop = blockTopPosition;
      this.lettersWrap && this.lettersWrap.forEach(lettersWrap => {
        lettersWrap.style.top = blockTopPosition;
      });
    }

    handleScroll() {
      if (window.scrollY >= this.lettersWrapOffsetTop) {
        this.letters.forEach(letter => {
          const target = this.querySelector(letter.getAttribute("href"));
          const rect = target.getBoundingClientRect();
          const topOffset = this.headerHeight + 10;

          if (target) {
            if (rect.top <= topOffset && rect.bottom >= topOffset) {
              letter.classList.add('active');
            } else {
              letter.classList.remove('active');
            }
          }
        });
      } else {
        this.letters[0].classList.add('active');
      }
    }
    
    handleSwitchTab(handle) {
      this.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === handle));
      this.tabContents && this.tabContents.forEach(tabContents => {
        tabContents.classList.toggle('hidden', tabContents.dataset.tab !== handle)
        tabContents.querySelector('.js-first-letter').classList.add('active');
      });
    }

    addEventListeners() {
      window.addEventListener('scroll', this.handleScroll.bind(this));

      this.tabs && this.tabs.forEach(tab => {
        const handle = tab.dataset['tab'];
        tab.addEventListener('click', () => this.handleSwitchTab(handle));
      });

      this.letters && this.letters.forEach(letter => {
        letter.addEventListener('click', () => {
          this.letters.forEach(letter => letter.classList.remove('active'));
          letter.classList.add('active');
        });
      });
    }

    removeEventListeners() {
      window.removeEventListener('scroll', this.handleScroll.bind(this));

      this.tabs && this.tabs.forEach(tab => {
        const handle = tab.dataset['tab'];
        tab.removeEventListener('click', () => this.handleSwitchTab(handle));
      });

      this.letters && this.letters.forEach(letter => {
        letter.removeEventListener('click', () => {
          this.letters.forEach(letter => letter.classList.remove('active'));
          letter.classList.add('active');
        });
      });
    }

    connectedCallback() {
      if (this.fancyBoxElms.length) Fancybox.bind('[data-fancybox]', {
        Thumbs: false,
        groupAttr: 'none',
      });

      this.addEventListeners();
      this.calculatePosition();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define(customElements.component, VideoTutorials);
}