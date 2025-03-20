customElements.component = "search-results";

if (!customElements.get(customElements.component)) {
  class SearchResults extends HTMLElement {
    constructor() {
      super();
      this.wrapper = this.closest("search-input-component");
      this.form = this.wrapper.querySelector("form");
      this.searchInput = this.form.querySelector("input[type='search']");
      this.resultsContainer = this.querySelector("[data-search-results]");
      this.debounceTimer = null;
      this.minSearchLength = 1;
      this.suggestions = this.wrapper.querySelectorAll("[data-suggestion]") || [];
      this.sectionWrapper = this.closest(".top-banner__wrapper");
      this.formWrapper = this.closest(".top-banner-wrapper");
      this.initialPosition = null;
      this.isHeaderSearch = !!this.closest("header") || !!this.closest(".search-banner");
      this.isHeroSearch = !!this.closest(".top-banner__wrapper");
      this.clearSearchButton = this.wrapper.querySelector("[data-clear-search]");
      this.isLoading = false;
      this.searches = [];
      this.observer = null;
      this.heroSearch = null;
      this.showHeaderSearch = false;
      this.stopRequests = false;
      this.lastScrollTop = 0;
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.searches = document.querySelectorAll("search-results");
      this.initSearch();
      this.initSuggestionsListener();
      this.initOutsideClick();
      if (this.isHeaderSearch) {
        this.initObserver();
      }
    }

    initObserver() {
      setTimeout(() => {
        this.heroSearch = Array.from(this.searches).find((search) => search.isHeroSearch);

        if (this.heroSearch) {
          let ticking = false;
          const headerHeight = 80;

          const updateHeaderSearch = () => {
            if (!this.heroSearch.formWrapper) return;

            const rect = this.heroSearch.formWrapper.getBoundingClientRect();
            const shouldShowHeader = rect.bottom <= headerHeight;

            if (shouldShowHeader && !this.showHeaderSearch) {
              this.heroSearch.stopRequests = true;
              this.heroSearch.searchInput.value = "";
              this.heroSearch.onBlurInput();
              this.heroSearch.clearResults();
              this.toggleTargetClass(this.wrapper, "show-search", true);
              this.showHeaderSearch = true;
              this.stopRequests = false;
            } else if (!shouldShowHeader && this.showHeaderSearch) {
              this.toggleTargetClass(this.wrapper, "show-search", false);
              this.searchInput.value = "";
              this.onBlurInput();
              this.clearResults();
              this.showHeaderSearch = false;
              this.searchInput.blur();
              this.stopRequests = false;
              this.heroSearch.stopRequests = false;
            }

            ticking = false;
          };

          const onScroll = () => {
            if (!ticking) {
              window.requestAnimationFrame(() => {
                updateHeaderSearch();
              });
              ticking = true;
            }
          };

          window.addEventListener("scroll", onScroll, { passive: true });

          this.scrollHandler = onScroll;
        } else {
          this.showHeaderSearch = true;
        }
      }, 0);
    }

    initSearch() {
      if (this.searchInput) {
        this.searchInput.addEventListener("input", this.handleSearchInput.bind(this));
        this.searchInput.addEventListener("focus", this.onFocusInput.bind(this));
        this.searchInput.addEventListener("blur", this.onBlurInput.bind(this));
      }
      if (this.clearSearchButton) {
        this.clearSearchButton.addEventListener("click", () => {
          this.searchInput.value = "";
          this.onBlurInput();
          this.clearResults();
        });
      }
    }

    initSuggestionsListener() {
      if (!this.suggestions.length) return;
      this.suggestions.forEach((suggestion) => {
        suggestion.addEventListener("click", this.onHandleSuggestionClick.bind(this));
      });
    }

    removeSuggestionsListener() {
      if (!this.suggestions.length) return;
      this.suggestions.forEach((suggestion) => {
        suggestion.removeEventListener("click", this.onHandleSuggestionClick.bind(this));
      });
    }

    handleSearchInput(event) {
      const searchTerm = event.target.value;

      if (this.sectionWrapper) {
        this.toggleTargetClass(this.sectionWrapper, "search-drawer-active", true);
      }

      if (searchTerm.length < this.minSearchLength) {
        this.clearResults();
        return;
      }

      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.performSearch(searchTerm);
      }, 500);
    }

    onFocusInput() {
      this.resetOtherSearches();
      this.toggleTargetClass(this.wrapper, "active", true);
      if (this.sectionWrapper && !this.sectionWrapper.classList.contains("search-drawer-active")) {
        const sectionRect = this.sectionWrapper.getBoundingClientRect();
        const formRect = this.wrapper.getBoundingClientRect();
        const topSpace = document.documentElement.clientWidth > 1023 ? 32 : 16;
        const targetPosition = -(formRect.top - sectionRect.top - topSpace);

        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 300);

        this.sectionWrapper.style.setProperty("--top-position", `${targetPosition}px`);
        this.toggleTargetClass(this.sectionWrapper, "search-drawer-active", true);
      }
    }

    onBlurInput() {
      setTimeout(() => {
        if (this.searchInput.value === "") {
          this.toggleTargetClass(this.wrapper, "active", false);
          if (this.sectionWrapper && this.sectionWrapper.classList.contains("search-drawer-active")) {
            this.toggleTargetClass(this.sectionWrapper, "search-drawer-active", false);
          }
        }
      }, 300);
    }

    async performSearch(term, url = null) {
      if (this.stopRequests) {
        return;
      }

      this.toggleTargetClass(this.wrapper, "active", true);
      this.setLoading(true);

      const searchTerm = term || this.searchInput.value;
      const searchUrl = url || this.buildSearchUrl(searchTerm);

      try {
        const currentRequest = { cancelled: false };
        this.currentRequest = currentRequest;

        const [searchResponse, suggestResponse] = await this.fetchSearchData(searchUrl, searchTerm);

        if (this.stopRequests || currentRequest.cancelled) {
          this.setLoading(false);
          return;
        }

        const parsedData = this.parseSearchResponse(searchResponse, suggestResponse);
        if (parsedData.searchResults && !parsedData.emptyBanner) {
          await this.renderSearchResults(parsedData, searchTerm);
        } else {
          this.handleEmptyResults(parsedData);
        }
        this.setLoadingState(this.resultsContainer, false);
      } catch (error) {
        if (!this.stopRequests) {
          console.error("Search error:", error);
          this.handleErrorState();
        }
        this.setLoadingState(this.resultsContainer, false);
      } finally {
        this.setLoadingState(this.resultsContainer, false);
        this.setLoading(false);
      }
    }

    buildSearchUrl(searchTerm) {
      return `/search?q=${encodeURIComponent(searchTerm)}&type=product&options[prefix]=last`;
    }

    async fetchSearchData(searchUrl, searchTerm) {
      const searchResponse = await fetch(searchUrl);
      const suggestResponse = await this.getSearchResults(searchTerm);
      return [await searchResponse.text(), suggestResponse];
    }

    parseSearchResponse(htmlResponse, suggestResponse) {
      if (this.stopRequests) {
        this.setLoading(false);
        return;
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlResponse, "text/html");

      return {
        searchResults: doc.querySelector("filters-container"),
        facetFilters: doc.querySelector("facet-filters"),
        facetFiltersContent: doc.querySelector("[data-collection-content]"),
        suggestElement: suggestResponse ? parser.parseFromString(suggestResponse, "text/html").body.firstChild : null,
        suggestions: doc.querySelectorAll("[data-suggestion]"),
        filtersContent: doc.querySelector(".facet-content"),
        productGrid: doc.querySelector(".product-grid-wrapper"),
        emptyBanner: doc.querySelector(".empty-state-banner"),
      };
    }

    async renderSearchResults(parsedData, searchTerm) {
      const {
        searchResults,
        facetFilters,
        facetFiltersContent,
        suggestElement,
        suggestions,
        filtersContent,
        productGrid,
      } = parsedData;

      this.handleSuggestions(suggestions);
      this.updateFiltersContent(facetFilters, filtersContent, suggestElement);
      this.updateClassStates(searchResults, facetFilters, facetFiltersContent);
      this.wrapper.removeAttribute("redirect-url");
      await this.updateResultsContainer(searchResults, facetFilters, searchTerm, productGrid);
    }

    handleSuggestions(suggestions) {
      if (suggestions.length > 0) {
        this.suggestions = [...this.suggestions, ...Array.from(suggestions)];
        this.removeSuggestionsListener();
        this.initSuggestionsListener();
      }
    }

    updateFiltersContent(facetFilters, filtersContent, suggestElement) {
      if (!facetFilters) return;

      const facetFiltersResults = facetFilters
        .querySelector("[data-search-drawer-results]")
        ?.content.querySelector(".content-wrapper");

      const suggestionPlace = facetFiltersResults.querySelector(".facet-content");

      if (suggestElement && suggestionPlace) {
        suggestionPlace.prepend(suggestElement);
      }

      const currentFacetFilters = this.querySelector("facet-filters");

      if (facetFilters) {
        if (facetFiltersResults) {
          if (currentFacetFilters && currentFacetFilters.classList.contains("open")) {
            this.toggleTargetClass(facetFilters, "open", true);
          }

          facetFilters.innerHTML = facetFiltersResults.innerHTML;
        }
      }

      const suggestions = facetFilters.querySelectorAll("[data-suggestion]");
      if (suggestions.length > 0) {
        this.handleSuggestions(suggestions);
      }
    }

    updateClassStates(searchResults, facetFilters = null, facetFiltersContent = null) {
      searchResults && this.toggleTargetClass(searchResults, "search-drawer", true);
      this.searchResults = searchResults;
      if (document.documentElement.clientWidth > 1023 && facetFilters) {
        this.toggleTargetClass(facetFilters, "open", true);
      }

      if (document.documentElement.clientWidth > 1023 && facetFiltersContent) {
        this.toggleTargetClass(facetFiltersContent, "active", true);
      }

      this.toggleTargetClass(this, "active", true);
      this.toggleTargetClass(this, "empty-container", false);

      if (document.documentElement.clientWidth <= 1023) {
        this.toggleTargetClass(document.body, "locked", true);
      }
    }

    async updateResultsContainer(searchResults, facetFilters, searchTerm) {
      if (this.resultsContainer.hasChildNodes()) {
        this.resultsContainer.replaceChild(searchResults, this.resultsContainer.firstElementChild);
      } else {
        this.resultsContainer.innerHTML = "";
        this.resultsContainer.appendChild(searchResults);
      }

      const newUrl = searchResults.getAttribute("data-url");
      this.resultsContainer && (this.resultsContainer.dataset.url = newUrl);

      this.initializeFiltersAndLoadMore(facetFilters, searchResults, searchTerm, newUrl);

      if (this.isHeaderSearch) {
        this.handleHeaderSearch();
        window.addEventListener("resize", this.handleHeaderSearch.bind(this));
      }
    }

    handleHeaderSearch() {
      if (this.isHeaderSearch) {
        if (document.documentElement.clientWidth >= 908) {
          this.style.width = "908px";
        } else {
          this.style.width = `${document.documentElement.clientWidth}px`;
        }
      }
    }

    initOutsideClick() {
      document.body.addEventListener("click", this.onOutsideClick.bind(this));
    }

    onOutsideClick(event) {
      if (this.isLoading) return;
      if (!event.target.closest("search-input-component")) {
        this.searchInput.value = "";
        this.onBlurInput();
        this.clearResults();
      }
    }

    initializeFiltersAndLoadMore(facetFilters, searchResults, searchTerm, newUrl) {
      setTimeout(() => {
        facetFilters.isSearchDrawer = true;
        facetFilters.pageUrl = `${newUrl}`;
        facetFilters.addEventListener("update-filters", (event) => {
          this.performSearch(searchTerm, event.detail.url);
        });
      }, 100);

      const loadMoreButton = searchResults.querySelector("[data-pagination-load-more]");
      loadMoreButton && loadMoreButton.addEventListener("click", this.onLoadMoreClick.bind(this));
    }

    handleErrorState() {
      if (this.stopRequests) {
        this.setLoading(false);
        return;
      }
      this.clearResults();
      this.setLoading(false);
      this.sectionWrapper && this.toggleTargetClass(this.sectionWrapper, "search-drawer-active", false);
      if (document.documentElement.clientWidth <= 1023) {
        this.toggleTargetClass(document.body, "locked", false);
      }
      this.toggleTargetClass(this.wrapper, "active", false);
    }

    handleEmptyResults(parsedData) {
      if (!parsedData.emptyBanner || this.stopRequests) {
        this.setLoading(false);
        return;
      }
      this.searchResults = parsedData.emptyBanner.querySelector(".empty-state-banner-content");

      this.resultsContainer.innerHTML = parsedData.emptyBanner.innerHTML;
      this.updateClassStates(parsedData.searchResults, parsedData.facetFilters, parsedData.facetFiltersContent);
      this.toggleTargetClass(this, "empty-container", true);
      this.wrapper.setAttribute("redirect-url", parsedData.emptyBanner.dataset.redirectUrl);
      this.wrapper.setAttribute("search-product", parsedData.emptyBanner.dataset.searchProduct);
      this.wrapper.querySelector("[data-empty-state-link]") &&
        this.wrapper.querySelector("[data-empty-state-link]").addEventListener("click", (e) => {
          e.preventDefault();
          this.form.dispatchEvent(new Event("submit", { bubbles: true }));
        });
    }

    async getSearchResults(searchTerm) {
      try {
        const response = await fetch(
          `/search/suggest.json?q=${encodeURIComponent(searchTerm)}&resources[type]=product,query`,
        );
        const data = await response.json();
        const terms = this.extractSearchTerms(data, searchTerm);
        return this.renderResults(terms);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    }

    extractSearchTerms(data, searchTerm) {
      const terms = new Set();
      terms.add(searchTerm);

      if (data.resources.results.queries) {
        data.resources.results.queries.forEach((query) => {
          terms.add(query.text.toLowerCase());
        });
      }

      if (data.resources.results.products) {
        data.resources.results.products.forEach((product) => {
          const title = product.title.toLowerCase();
          if (title === searchTerm.toLowerCase()) {
            return;
          }
          const words = title.split(" ");

          words.forEach((word) => {
            if (word.includes(searchTerm.toLowerCase()) && word.length > 2) {
              const capitalizedWord = word[0].toUpperCase() + word.slice(1);
              terms.add(capitalizedWord);
            }
          });

          if (title.includes(searchTerm.toLowerCase())) {
            const capitalizedTitle = product.title[0].toUpperCase() + product.title.slice(1);
            terms.add(capitalizedTitle);
          }
        });
      }

      return Array.from(terms).slice(0, 5);
    }

    renderResults(terms) {
      if (terms.length === 1 && terms[0] === this.searchInput.value) {
        return null;
      }

      const html = `
        <div class="predictive-terms flex flex-col px-8 lg:px-0 gap-8 bg-white lg:bg-grey pb-24 mb-24 border-grey-100 border-b-1 border-solid">
          ${terms
            .map(
              (term) => `
            <button 
              class='rounded-4 px-8 py-2 body-2 text-left hover:bg-orange-100 hover:text-white cursor-pointer transition-colors ${term === this.searchInput.value ? "bg-orange-100 text-white" : "text-grey-600 bg-transparent"}'
              data-term="${term}"
              role="option"
              data-suggestion="${term}"
            >
              ${term}
            </button>
          `,
            )
            .join("")}
        </div>
      `;
      return html;
    }

    onHandleSuggestionClick(event) {
      if (this.isLoading) return;
      this.setLoadingState(this.resultsContainer, true);
      this.searchInput.value = event.currentTarget.dataset.suggestion;
      this.onFocusInput();
      this.performSearch(this.searchInput.value);
    }

    onLoadMoreClick(event) {
      const nextPageUrl = event.currentTarget.dataset.page;
      this.setLoadingState(event.currentTarget, true);
      this.loadMoreResults(nextPageUrl, this.searchInput.value);
    }

    clearResults() {
      if (this.currentRequest) {
        this.currentRequest.cancelled = true;
      }

      this.toggleTargetClass(this, "active", false);

      setTimeout(() => {
        this.resultsContainer.innerHTML = "";
        if (document.documentElement.clientWidth <= 1023) {
          this.toggleTargetClass(document.body, "locked", false);
        }
      }, 300);
    }

    disconnectedCallback() {
      if (this.scrollHandler) {
        window.removeEventListener("scroll", this.scrollHandler);
      }

      clearTimeout(this.debounceTimer);
      this.searchInput.removeEventListener("input", this.handleSearchInput.bind(this));
      if (document.documentElement.clientWidth <= 1023) {
        this.toggleTargetClass(document.body, "locked", false);
      }
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }

    async loadMoreResults(url, searchTerm) {
      const oldLoadMoreButton = this.resultsContainer.querySelector("[data-pagination-load-more]");
      try {
        this.setLoading(true);
        const [searchResponse] = await this.fetchSearchData(url, searchTerm);
        const parsedData = this.parseSearchResponse(searchResponse, null);
        if (parsedData.searchResults && !parsedData.emptyBanner) {
          const newResults = parsedData.productGrid.innerHTML;
          const resultsContainer = this.resultsContainer.querySelector(".product-grid-wrapper");
          resultsContainer.innerHTML += newResults;

          const newLoadMoreButton = parsedData.searchResults.querySelector("[data-pagination-load-more]");

          if (oldLoadMoreButton && newLoadMoreButton) {
            oldLoadMoreButton.dataset.page = newLoadMoreButton.dataset.page;
          } else if (oldLoadMoreButton) {
            oldLoadMoreButton.remove();
          }
        } else {
          this.resultsContainer.innerHTML = parsedData.emptyBanner.innerHTML;
        }
        this.setLoadingState(oldLoadMoreButton, false);
      } catch (error) {
        this.setLoadingState(oldLoadMoreButton, false);
        console.error("Load more error:", error);
      } finally {
        this.setLoading(false);
        this.setLoadingState(oldLoadMoreButton, false);
      }
    }

    setLoading(loading) {
      this.isLoading = loading;
      this.wrapper.classList.toggle("loading", loading);
      this.resultsContainer && this.setLoadingState(this.resultsContainer, loading);
    }

    setLoadingState(target, flag) {
      target && this.toggleTargetClass(target, "is-loading", flag);
    }

    resetOtherSearches() {
      this.searches.forEach((search) => {
        if (search !== this) {
          search.stopRequests = true;
          search.searchInput.value = "";
          search.onBlurInput();
          search.clearResults();
          search.toggleTargetClass(search.wrapper, "active", false);
          if (search.sectionWrapper) {
            search.toggleTargetClass(search.sectionWrapper, "search-drawer-active", false);
          }
          setTimeout(() => {
            search.stopRequests = false;
          }, 300);
        }
      });
    }
  }

  customElements.define(customElements.component, SearchResults);
}
