customElements.component = "brands-page";

if (!customElements.get(customElements.component)) {
  class BrandsPage extends HTMLElement {
    constructor() {
      super();
      this.state = {
        currentView: "brands",
        currentType: null,
        currentBrand: null,
        sortOrder: "name-asc",
        isMobile: window.innerWidth < 1024,
      };
      this.grid = this.querySelector(".brands-page__grid");
      this.backButton = this.querySelector(".brands-page-back");
      this.typeButtons = this.querySelectorAll(".tab-item");
      this.sortDropdown = this.querySelector('custom-dropdown[data-page="brand"]');
      this.cards = this.querySelectorAll(".brands-page__grid > div");
      this.sortSelect = this.querySelector(".brands-page-tools__sort");
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.applyInitialView();
      this.addEventListeners();
      this.sortCards();
      this.grid.classList.add("loaded");
      this.backButton.classList.add("loaded");
    }

    applyInitialView() {
      this.hideBackButton();
      const activeTypeButton = this.querySelector(".tab-item.active");
      if (activeTypeButton) {
        this.state.currentType = activeTypeButton.dataset.type;
        this.filterCards();
      }
    }

    addEventListeners() {
      this.typeButtons.forEach((button) => {
        button.addEventListener("click", (e) => this.handleTypeClick(e));
      });

      this.sortSelect.querySelector("select").addEventListener("change", (e) => this.handleSort(e));

      this.backButton.addEventListener("click", () => this.handleBack());

      this.bindCardEvents();

      window.addEventListener("resize", () => this.handleResize());
    }

    bindCardEvents() {
      this.cards.forEach((card) => {
        if (!card.dataset.model) {
          card.querySelector("button")?.addEventListener("click", () => {
            this.showModels(card.dataset.brand, card.dataset.type);
          });

          if (this.state.isMobile) {
            card.addEventListener("click", (e) => {
              const button = e.target.closest("button");
              if (!button) {
                this.showModels(card.dataset.brand, card.dataset.type);
              }
            });
          }
        } else {
          const link = card.querySelector("a");
          if (link && this.state.isMobile) {
            card.addEventListener("click", (e) => {
              if (!e.target.closest("a")) {
                window.location.href = link.href;
              }
            });
          }
        }
      });
    }

    handleResize() {
      const wasMobile = this.state.isMobile;
      this.state.isMobile = window.innerWidth < 1024;

      if (wasMobile !== this.state.isMobile) {
        this.removeCardListeners();
        this.addCardListeners();
      }
    }

    removeCardListeners() {
      this.cards.forEach((card) => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
      });
      this.cards = this.querySelectorAll(".brands-page__grid > div");
    }

    addCardListeners() {
      this.bindCardEvents();
    }

    handleTypeClick(e) {
      const selectedType = e.target.dataset.type;
      this.typeButtons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");

      if (this.state.currentView === "models") {
        this.handleBack();
      }

      this.state.currentType = selectedType;
      this.filterCards();
      this.sortCards();
    }

    handleSort(e) {
      this.state.sortOrder = e.target.value;
      this.sortCards();
    }

    handleBack() {
      this.state.currentView = "brands";
      this.state.currentBrand = null;
      this.hideBackButton();
      this.showSortSelect();
      this.showAllCards();
      this.filterCards();
      this.sortCards();
    }

    showModels(brand, type) {
      this.state.currentView = "models";
      this.state.currentBrand = brand;
      this.showBackButton();
      this.hideSortSelect();

      this.cards.forEach((card) => {
        const isModel = card.dataset.model;
        const matchesBrand = card.dataset.brand === brand;
        const matchesType = card.dataset.type === type;
        card.style.display = isModel && matchesBrand && matchesType ? "block" : "none";
      });
    }

    filterCards() {
      if (this.state.currentView === "brands") {
        this.cards.forEach((card) => {
          const matchesType = !this.state.currentType || card.dataset.type === this.state.currentType;
          const isBrand = !card.dataset.model;
          card.style.display = matchesType && isBrand ? "block" : "none";
        });
      }
    }

    sortCards() {
      const cardsArray = Array.from(this.cards).filter((card) => card.style.display !== "none");

      cardsArray.sort((a, b) => {
        const aValue = this.state.currentView === "models" ? a.dataset.model : a.dataset.brand;
        const bValue = this.state.currentView === "models" ? b.dataset.model : b.dataset.brand;

        switch (this.state.sortOrder) {
          case "name-asc":
            return aValue.localeCompare(bValue);
          case "name-desc":
            return bValue.localeCompare(aValue);
          case "newest":
            return Array.from(this.cards).indexOf(b) - Array.from(this.cards).indexOf(a);
          default:
            return 0;
        }
      });

      cardsArray.forEach((card) => {
        this.grid.appendChild(card);
      });
    }

    showAllCards() {
      this.cards.forEach((card) => {
        card.style.display = "block";
      });
    }

    showBackButton() {
      this.backButton.style.display = "flex";
    }

    hideBackButton() {
      this.backButton.style.display = "none";
    }

    showSortSelect() {
      this.sortSelect.style.display = "block";
    }

    hideSortSelect() {
      this.sortSelect.style.display = "none";
    }
  }

  customElements.define(customElements.component, BrandsPage);
}
