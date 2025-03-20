customElements.component = "side-cart";

if (!customElements.get(customElements.component)) {
  class SideCart extends HTMLElement {
    constructor() {
      super();
      this.cartModal = this.querySelector("[data-id='side-cart']");
      this.handlerModal = this.querySelector("[data-id='atc-handler']");
      this.cartPageContainer = document.querySelector(".cart-page-container");
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initListeners();
    }

    initListeners() {
      document.addEventListener("liquid-ajax-cart:init", () => {
        this.toggleTargetClass(this, "initialized", true);
        window.liquidAjaxCart.conf("updateOnWindowFocus", false);
      });

      document.addEventListener("liquid-ajax-cart:queue-start", () => {
        this.toggleTargetClass(this.cartModal, "loading", true);
        this.toggleTargetClass(this.handlerModal, "loading", true);
        this.cartPageContainer && this.toggleTargetClass(this.cartPageContainer, "loading", true);
      });

      document.addEventListener("liquid-ajax-cart:queue-end", () => {
        this.toggleTargetClass(this.cartModal, "loading", false);
        this.toggleTargetClass(this.handlerModal, "loading", false);
        this.cartPageContainer && this.toggleTargetClass(this.cartPageContainer, "loading", false);

        if (this.cartModal.classList.contains("open")) {
          this.handlerModal.classList.remove("open");
        }
      });

      document.addEventListener("liquid-ajax-cart:request-start", () => {
        this.toggleTargetClass(this.cartModal, "loading", true);
        this.toggleTargetClass(this.handlerModal, "loading", true);
        this.cartPageContainer && this.toggleTargetClass(this.cartPageContainer, "loading", true);
      });

      document.addEventListener("liquid-ajax-cart:request-end", ({ detail }) => {
        document.body.classList.add("js-show-ajax-cart");

        detail.sections.forEach((section) => {
          if (section.id.includes("side-cart") && this.cartModal.classList.contains("open")) {
            section.elements[0].querySelector('[data-id="side-cart"]').classList.add("open");
          }
        });

        this.toggleTargetClass(this.cartModal, "loading", false);
        this.toggleTargetClass(this.handlerModal, "loading", false);
        this.cartPageContainer && this.toggleTargetClass(this.cartPageContainer, "loading", false);
      });
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }
  }

  customElements.define(customElements.component, SideCart);
}
