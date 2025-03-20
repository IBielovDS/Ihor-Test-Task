customElements.component = "account-info";

if (!customElements.get(customElements.component)) {
  class AccountInfo extends HTMLElement {
    constructor() {
      super();

      this.tabs = this.querySelectorAll(".js-account-info-tab");
      this.tabContents = this.querySelectorAll(".js-account-info-tab-content");
      this.deleteButtons = this.querySelectorAll(".js-delete-address");
      this.tooltipCreate = this.querySelector(".js-tooltip-create");
      this.tooltipDelete = this.querySelector(".js-tooltip-delete");
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }

    async handleDelete(addressId) {
      try {
        await fetch(`/account/addresses/${addressId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
        });
        
        window.location.href = '/account?tooltip=delete';
      } catch (error) {
        console.error("Error:", error);
      }
    }

    addEventListeners() {
      this.tabs &&
        this.tabs.forEach((tab) => {
          tab.addEventListener("click", () => {
            const handle = tab.dataset["tab"];

            this.tabs.forEach((tab) => this.toggleTargetClass(tab, "active", false));

            this.tabContents.forEach((tabContent) => {
              if (tabContent.dataset["tab"] === handle) {
                this.toggleTargetClass(tab, "active", true);
                this.toggleTargetClass(tabContent, "hidden", false);
              } else {
                this.toggleTargetClass(tabContent, "hidden", true);
              }
            });
          });
        });

      this.deleteButtons.forEach((button) =>
        button.addEventListener("click", this.handleDelete.bind(this, button.dataset["addressId"])),
      );
    }

    initProvinceSelects() {
      new Shopify.CountryProvinceSelector('desktop_add_address[country]', 'desktop_add_address[province]', {
        hideElement: 'desktop_add_address[province]New',
      });
      new Shopify.CountryProvinceSelector('mobile_add_address[country]', 'mobile_add_address[province]', {
        hideElement: 'mobile_add_address[province]New',
      });
    }

    init() {
      const urlParams = new URLSearchParams(window.location.search);
      const tooltipParam = urlParams.get("tooltip");

      if (tooltipParam === "create") {
        this.toggleTargetClass(this.tooltipCreate, "open", true);
      } else if (tooltipParam === "delete") {
        this.toggleTargetClass(this.tooltipDelete, "open", true);
      }

      setTimeout(() => {
        this.toggleTargetClass(this.tooltipDelete, "open", false);
        this.toggleTargetClass(this.tooltipCreate, "open", false);

        const url = new URL(window.location);
        url.searchParams.delete("tooltip");
        window.history.replaceState({}, document.title, url);
      }, 5000);

      this.initProvinceSelects();
    }

    connectedCallback() {
      this.init();
      this.addEventListeners();
    }
  }

  customElements.define(customElements.component, AccountInfo);
}
