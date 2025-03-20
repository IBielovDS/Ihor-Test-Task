class StickyAddToCart extends HTMLElement {
  constructor() {
    super();
    this.quantityInput = this.querySelector(".js-quantity-input");
    this.quantityMinus = this.querySelector(".js-quantity-minus");
    this.quantityPlus = this.querySelector(".js-quantity-plus");
    this.mainAddToCartBtn = document.querySelector(".product-form__submit");
    this.observer = null;
  }

  initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          this.sectionShowed = true;
          this.show();
        } else {
          this.sectionShowed = false;
          this.hide();
        }
      });
    }, options);

    if (this.mainAddToCartBtn) {
      this.observer.observe(this.mainAddToCartBtn);
    }
  }

  handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = ((scrollTop / docHeight) * 100).toFixed(0);


    if (scrollPercent >= 95) {
      this.hide();
    } else if (this.sectionShowed) {
      this.show();
    }
  }

  show() {
    requestAnimationFrame(() => {
      this.classList.remove("opacity-0", "pointer-events-none", "translate-y-full");
    });
  }

  hide() {
    requestAnimationFrame(() => {
      this.classList.add("opacity-0", "pointer-events-none", "translate-y-full");
    });
  }

  connectedCallback() {
    this.initIntersectionObserver();
    window.addEventListener("scroll", this.handleScroll.bind(this));
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

customElements.define("sticky-add-to-cart", StickyAddToCart);
