customElements.component = "facet-filters";

if (!customElements.get(customElements.component)) {
  class FacetFilters extends HTMLElement {
    constructor() {
      super();
      this.form = null;
      this.closePopupButton = null;
      this.openPopupButton = null;
      this.additionalFilters = null;
      this.gridContentWrapper = null;
      this.resetButton = null;
      this.form = null;
      this.paginationLinks = null;
      this.body = null;
      this.isSearchDrawer = false;
      this.pageUrl = null;
      this.contentContainer = null;
    }

    connectedCallback() {
      this.init();
      this.pageUrl = this.getAttribute("data-url") || window.location.href;
    }

    init() {
      this.initSelectors();
      this.initListeners();
    }

    initSelectors() {
      this.closePopupButtons = this.querySelectorAll('[data-action="close-popup"]');
      this.applyFiltersButtons = this.querySelectorAll('[data-action="apply-filters"]');
      this.openPopupButtons = document.querySelectorAll('[data-action="open-popup"]');
      this.additionalFilters = document.querySelectorAll("[data-additional-filter]");
      this.sortFilter = document.querySelector("[data-sort-filter]");
      this.gridContentWrapper = document.querySelector("[data-collection-content]");
      this.clearButton = this.querySelector("[data-action='clear-filters']");
      this.deleteFiltersButtons = this.querySelectorAll("[data-reset-filters]");
      this.paginationLinks = document.querySelectorAll("[data-pagination-link]");
      this.form = this.querySelector("form");
      this.body = document.querySelector("body");
      this.contentContainer = this.closest("filters-container");
    }

    initListeners() {
      if (this.closePopupButtons.length) {
        this.closePopupButtons.forEach((button) => {
          button.addEventListener("click", () => {
            this.togglePopup(false);
            this.openPopupButtons.forEach((button) => {
              this.toggleTargetClass(button, "active", false);
            });
          });
        });
      }

      if (this.applyFiltersButtons.length) {
        this.applyFiltersButtons.forEach((button) => {
          button.addEventListener("click", () => {
            this.togglePopup(false);
            this.openPopupButtons.forEach((button) => {
              this.toggleTargetClass(button, "active", false);
            });
          });
        });
      }

      if (this.openPopupButtons.length) {
        this.openPopupButtons.forEach((button) => {
          button.addEventListener("click", () => {
            this.togglePopup(true);
            this.toggleTargetClass(button, "active", !button.classList.contains("active"));
          });
        });
      }

      if (this.clearButton) {
        this.clearButton.addEventListener("click", () => {
          const url = this.clearButton.getAttribute("data-href");

          this.requestFilteredCollection(url);
        });
      }

      if (this.deleteFiltersButtons.length) {
        this.deleteFiltersButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const url = button.getAttribute("data-href");

            this.requestFilteredCollection(url);
          });
        });
      }

      if (this.additionalFilters.length) {
        this.additionalFilters.forEach((filter) => {
          filter.addEventListener("change", () => {
            const url = this.changeUrl(filter.name, filter.value, filter.checked ? "append" : "delete");

            this.requestFilteredCollection(url);
          });
        });
      }

      if (this.sortFilter) {
        this.sortFilter.addEventListener("change", () => {
          const url = this.changeUrl(this.sortFilter.name, this.sortFilter.value, "set");

          this.requestFilteredCollection(url);
        });
      }

      if (this.paginationLinks.length) {
        this.paginationLinks.forEach((link) => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");

            this.requestFilteredCollection(url);
            this.scrollTop();
          });
        });
      }

      if (this.form) {
        this.initFormListener();
      }

      this.addEventListener("click", (e) => {
        if (e.target === this) {
          this.toggleTargetClass(this.openPopupButton, "active", false);
          this.openPopupButtons.forEach((button) => {
            this.toggleTargetClass(button, "active", false);
          });
          this.togglePopup(false);
        }
      });
    }

    initFormListener() {
      const inputs = this.form.querySelectorAll("input");
      if (inputs.length) {
        inputs.forEach((input) => {
          input.addEventListener("change", () => {
            const url = this.changeUrl(input.name, input.value, input.checked ? "append" : "delete");

            this.requestFilteredCollection(url);
          });
        });
      }
    }

    togglePopup(isShow) {
      this.toggleTargetClass(this, "open", !this.classList.contains("open"));
      if (window.innerWidth < 1024) {
        this.toggleTargetClass(this.body, "overflow-hidden", isShow);
      } else {
        if (this.gridContentWrapper) {
          this.toggleTargetClass(
            this.gridContentWrapper,
            "active",
            !this.gridContentWrapper.classList.contains("active"),
          );
        }
      }
    }

    changeUrl(key, value, type = "set") {
      let url = new URL(this.pageUrl);
      switch (type) {
        case "set":
          url.searchParams.set(key, `${value}`);
          break;
        case "append":
          url.searchParams.append(key, `${value}`);
          break;
        case "delete":
          url.searchParams.delete(key, `${value}`);
          break;
      }

      url.searchParams.has("page") ? url.searchParams.set("page", 1) : null;
      this.pageUrl = url.toString();
      return url.toString();
    }

    replaceUrl(url) {
      window.history.replaceState({}, "", url);
    }

    async requestFilteredCollection(url) {
      if (this.isSearchDrawer) {
        const updateEvent = new CustomEvent("update-filters", { detail: { url } });
        this.dispatchEvent(updateEvent);
        this.setLoadingState();
        return;
      }
      this.toggleTargetClass(this.body, "loading", true);
      this.setLoadingState();
      try {
        const response = await fetch(`${url}`);
        const responseText = await response.text();
        const html = new DOMParser().parseFromString(responseText, "text/html");
        const content = html.querySelector("#MainContent");
        this.replaceUrl(url);
        this.replaceContent(content);
      } catch (error) {
        this.removeLoadingState();
        console.error(error);
      } finally {
        this.removeLoadingState();
        this.toggleTargetClass(this.body, "loading", false);
      }
    }

    replaceContent(content) {
      this.replaceTitleFilters(content);
      this.replaceCollectionContainer(content);
    }

    replaceCollectionContainer(content) {
      const newCollectionContainer = content.querySelector("filters-container");
      const oldCollectionContainer = document.querySelector("filters-container");
      const updatedContent = this.updateFilters(newCollectionContainer);
      oldCollectionContainer.replaceWith(updatedContent);
      oldCollectionContainer.setAttribute("data-url", this.pageUrl);
    }

    updateFilters(content) {
      const fitlers = content.querySelector("facet-filters");
      if (this.classList.contains("open")) {
        fitlers.classList.add("open");
      }

      const newAccordions = content.querySelectorAll("custom-accordion");
      const oldAccordions = this.querySelectorAll("custom-accordion");
      newAccordions.forEach((accordion, index) => {
        const oldAccordion = oldAccordions[index];
        if (oldAccordion.querySelector("details").open) {
          accordion.querySelector("details").open = true;
        }
        if (oldAccordion.classList.contains("show-more")) {
          accordion.classList.add("show-more");
        }
      });
      if (this.gridContentWrapper.classList.contains("active")) {
        content.querySelector("[data-collection-content]").classList.add("active");
      }
      this.openPopupButtons.forEach((button) => {
        if (button.classList.contains("active")) {
          content.querySelector("[data-action='open-popup']").classList.add("active");
        }
      });

      return content;
    }

    replaceTitleFilters(content) {
      const titleFilters = content.querySelector("filters-tabs");
      const oldTitleFilters = document.querySelector("filters-tabs");

      if (titleFilters && oldTitleFilters) {
        oldTitleFilters.replaceWith(titleFilters);
      }
    }

    scrollTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setLoadingState() {
      this.toggleTargetClass(this.contentContainer, "is-loading", true);
      this.applyFiltersButtons.forEach((button) => {
        this.toggleTargetClass(button, "is-loading", true);
      });
    }

    removeLoadingState() {
      this.toggleTargetClass(this.contentContainer, "is-loading", false);
      this.applyFiltersButtons.forEach((button) => {
        this.toggleTargetClass(button, "is-loading", false);
      });
    }

    toggleTargetClass(target, className, flag) {
      target && target.classList.toggle(className, flag);
    }
  }

  customElements.define(customElements.component, FacetFilters);
}
