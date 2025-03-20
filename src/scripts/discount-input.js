customElements.component = "discount-input";

if (!customElements.get(customElements.component)) {
  class DiscountInput extends HTMLElement {
    constructor() {
      super();

      this.clearBtn = this.querySelector("[data-clear-discount]");
      this.applyBtn = this.querySelector("[data-apply-discount]");
      this.discountCodeInput = this.querySelector("input");
      this.authorization_token = null;
      this.cart = this.closest("custom-modal") || this.closest(".cart-page-container");
      this.isLoading = false;
    }

    connectedCallback() {
      this.initSelectors();
      this.init();
    }

    initSelectors() {
      this.clearBtn = this.querySelector("[data-clear-discount]");
      this.applyBtn = this.querySelector("[data-apply-discount]");
      this.discountCodeInput = this.querySelector("input");
    }

    init() {
      this.initListeners();
    }

    initListeners() {
      if (this.discountCodeInput) {
        this.discountCodeInput.addEventListener("input", (e) => {
          this.toggleTargetClass(this.discountCodeInput.closest(".input-wrapper"), "error", false);
        });
      }
      if (this.applyBtn) {
        this.applyBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.applyDiscount(this.discountCodeInput.value);
        });
      }

      if (this.clearBtn) {
        this.clearBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.clearDiscount();
        });
      }
    }

    setLoading(loading) {
      this.isLoading = loading;
      this.cart.classList.toggle("loading", loading);
      if (this.applyBtn) {
        if (loading) {
          this.applyBtn.setAttribute("disabled", "");
          this.toggleTargetClass(this.applyBtn, "is-loading", true);
          this.discountCodeInput.setAttribute("readonly", "");
        } else {
          this.applyBtn.removeAttribute("disabled");
          this.toggleTargetClass(this.applyBtn, "is-loading", false);
          this.discountCodeInput.removeAttribute("readonly");
        }
      }

      if (this.clearBtn) {
        if (loading) {
          this.clearBtn.setAttribute("disabled", "");
          this.toggleTargetClass(this.clearBtn, "is-loading", true);
        } else {
          this.clearBtn.removeAttribute("disabled");
          this.toggleTargetClass(this.clearBtn, "is-loading", false);
        }
      }

      if (this.discountCodeInput) {
        this.discountCodeInput.disabled = loading;
      }

      this.cart.classList.toggle("loading", loading);
    }

    toggleTargetClass(target, className, condition) {
      target.classList.toggle(className, condition);
    }

    async clearDiscount() {
      if (this.isLoading) return;

      this.setLoading(true);
      this.clearLocalStorage();

      try {
        await fetch("/discount/CLEAR");
        window.liquidAjaxCart.update();
        this.clearLocalStorage();
        this.discountCodeInput.value = "";
      } catch (error) {
        console.log(error);
      } finally {
        this.setLoading(false);
      }
    }

    clearLocalStorage() {
      localStorage.removeItem("discountCode");
    }

    async applyDiscount(code) {
      if (this.isLoading) return;

      this.setLoading(true);

      try {
        const configResponse = await fetch("/payments/config", { method: "GET" });
        const configData = await configResponse.json();

        const checkout_json_url = "/wallets/checkouts/";
        this.authorization_token = btoa(configData.paymentInstruments.accessToken);

        const cartResponse = await fetch("/cart.js", {});
        const cartData = await cartResponse.json();

        const body = {
          checkout: {
            country: Shopify.country,
            discount_code: code,
            line_items: cartData.items,
            presentment_currency: Shopify.currency.active,
          },
        };

        const checkoutResponse = await fetch(checkout_json_url, {
          headers: {
            accept: "*/*",
            "cache-control": "no-cache",
            authorization: "Basic " + this.authorization_token,
            "content-type": "application/json, text/javascript",
            pragma: "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          method: "POST",
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(body),
        });

        const checkoutData = await checkoutResponse.json();

        if (checkoutData.checkout && checkoutData.checkout.applied_discounts.length > 0) {
          const discountApplyUrl = "/discount/" + code;
          await fetch(discountApplyUrl);

          const localStorageValue = {
            code: code.trim(),
            totalCart: checkoutData.checkout.total_line_items_price,
          };

          localStorage.setItem("discountCode", JSON.stringify(localStorageValue));
          this.toggleTargetClass(this.discountCodeInput.closest(".input-wrapper"), "error", false);
          window.liquidAjaxCart.update();
        } else {
          this.clearLocalStorage();
          this.toggleTargetClass(this.discountCodeInput.closest(".input-wrapper"), "error", true);
        }
      } catch (error) {
        console.error(error);
        this.toggleTargetClass(this.discountCodeInput.closest(".input-wrapper"), "error", true);
      } finally {
        this.setLoading(false);
      }
    }
  }

  customElements.define(customElements.component, DiscountInput);
}
