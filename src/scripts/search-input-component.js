customElements.component = "search-input-component";

if (!customElements.get(customElements.component)) {
  class SearchInput extends HTMLElement {
    constructor() {
      super();
      this.btn = this.querySelector("button");
      this.trendingSearches = this.querySelectorAll(".trending-searches a");
      this.form = this.querySelector("form");
      this.input = this.querySelector("input[type='search']");
      this.trendingSearchesClick = this.trendingSearchesClick.bind(this);
      this.onFormSubmit = this.onFormSubmit.bind(this);
      this.clearSearchButton = this.querySelector(".clear-search-button");
      this.searchButton = this.querySelector(".search-button");
    }

    init() {
      this.addEventListeners();
    }

    addEventListeners() {
      this.form.addEventListener("submit", this.onFormSubmit);

      this.trendingSearches.forEach((trendingSearch) => {
        trendingSearch.addEventListener("click", this.trendingSearchesClick);
      });

      this.searchButton && this.searchButton.addEventListener("click", () => this.input.focus());

      this.clearSearchButton && this.clearSearchButton.addEventListener("click", () => this.clearSearch());
    }

    trendingSearchesClick(e) {
      e.preventDefault();
      const searchText = e.target.textContent;

      this.input.value = searchText;
    }

    clearSearch() {
      this.input.value = "";
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    async onFormSubmit(e) {
      e.preventDefault();
      const redirectUrl = this.getAttribute("redirect-url");
      const searchProduct = this.getAttribute("search-product");
      const isLoading = this.classList.contains("loading");

      if (isLoading) return;

      if (redirectUrl) {
        try {
          if (searchProduct) {
            await fetch("/cart/update.json", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                attributes: {
                  search_product: searchProduct,
                },
              }),
            });
          }
          window.location.href = redirectUrl;
        } catch (error) {
          throw new Error(error);
        }
      } else {
        this.form.submit();
      }
    }

    connectedCallback() {
      this.init();
    }
  }

  customElements.define(customElements.component, SearchInput);
}
