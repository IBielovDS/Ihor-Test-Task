customElements.component = 'market-selector-widget';

if (!customElements.get(customElements.component)) {
  class MarketSelector extends HTMLElement {
    constructor() {
      super();
      this.debug = true;
      this.sessionStorageKey = 'marketSelectorDismissed';
      this.detectedCountry = null;
      this.detectedLanguage = null;
      this.suggestionModal = this.querySelector('.market-suggestion-modal');
      this.countryModal = this.querySelector('.country-selector-modal');
      this.suggestionTitle = this.querySelector('.suggestion-title');
      this.shopNowText = this.querySelector('.shop-now span');
      this.changeCountryText = this.querySelector('.change-country');
      this.selectCountryTitle = this.querySelector('.select-country-title');
      this.updateCountryText = this.querySelector('.update-country-text');
      this.countryForm = this.querySelector('.country-select-form');
      this.closeButtons = this.querySelectorAll('button[aria-label="Close"]');
      this.shopNowButton = this.querySelector('.shop-now');
      this.changeCountryButton = this.querySelector('.change-country');
    }

    connectedCallback() {
      this.loadTextsFromAttributes();
      this.init();
    }

    loadTextsFromAttributes() {
      this.shopNowText.textContent = this.dataset.shopNowText;
      this.changeCountryText.textContent = this.dataset.changeCountryText;
      this.selectCountryTitle.textContent = this.dataset.selectCountryTitle;
      this.updateCountryText.textContent = this.dataset.updateCountryText;
    }

    async init() {
      if (!this.isModalDismissedForSession()) {
        await this.checkLocation();
      }
      this.setupEventListeners();
    }

    setupEventListeners() {
      [this.suggestionModal, this.countryModal].forEach((modal) => {
        modal.addEventListener('click', (event) => this.handleOverlayClick(event));
      });
      this.closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const modal = button.closest('[role="dialog"]');
          if (modal.classList.contains('market-suggestion-modal')) {
            this.closeModal();
          } else {
            this.closeCountrySelector();
          }
        });
      });
      this.shopNowButton.addEventListener('click', () => this.handleShopNow());
      this.changeCountryButton.addEventListener('click', () => this.showCountrySelector());
      this.countryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.updateLocalization({
          country: formData.get('country_code'),
          language: window.Shopify.language,
        });
        this.markModalDismissedForSession();
      });
    }

    isModalDismissedForSession() {
      return sessionStorage.getItem(this.sessionStorageKey) === 'true';
    }

    markModalDismissedForSession() {
      sessionStorage.setItem(this.sessionStorageKey, 'true');
    }

    handleOverlayClick(event) {
      if (event.target === event.currentTarget) {
        if (event.currentTarget.classList.contains('market-suggestion-modal')) {
          this.closeModal();
        } else if (event.currentTarget.classList.contains('country-selector-modal')) {
          this.closeCountrySelector();
        }
        this.markModalDismissedForSession();
      }
    }

    async checkLocation() {
      try {
        const response = await fetch(
          window.Shopify.routes.root +
          'browsing_context_suggestions.json' +
          '?country[enabled]=true' +
          `&country[exclude]=${window.Shopify.country}` +
          '&language[enabled]=true' +
          `&language[exclude]=${window.Shopify.language}`,
        );

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
          const suggestion = data.suggestions[0];
          this.detectedCountry = suggestion.parts.country.handle;
          this.detectedLanguage = suggestion.parts.language.handle;

          if (this.detectedCountry !== window.Shopify.country) {
            this.showSuggestionModal(suggestion);
          }
        }
      } catch (error) {
        console.error('Error checking location:', error);
      }
    }

    showSuggestionModal(suggestion) {
      const titleTemplate = this.dataset.suggestionTitle || 'It seems you are in [country]';
      const formattedTitle = titleTemplate.replace('[country]', suggestion.parts.country.name);
      this.suggestionTitle.innerHTML = formattedTitle; // Using innerHTML to support <br> tags
      this.suggestionModal.classList.remove('hidden');
      this.suggestionModal.classList.add('flex');
    }

    closeModal() {
      this.suggestionModal.classList.add('hidden');
      this.suggestionModal.classList.remove('flex');
      this.markModalDismissedForSession();
    }

    showCountrySelector() {
      this.closeModal();
      this.countryModal.classList.remove('hidden');
      this.countryModal.classList.add('flex');
    }

    closeCountrySelector() {
      this.countryModal.classList.add('hidden');
      this.countryModal.classList.remove('flex');
      this.markModalDismissedForSession();
    }

    handleShopNow() {
      this.updateLocalization({
        country: this.detectedCountry,
        language: this.detectedLanguage,
      });
      this.markModalDismissedForSession();
    }

    updateLocalization({ country, language }) {
      const formId = crypto.randomUUID();
      const formHtml = `
      <form id="${formId}" action="/localization" method="POST" hidden>
        <input name="_method" value="PUT">
        <input name="country_code" value="${country}">
        <input name="language_code" value="${language}">
      </form>
    `;
      document.body.insertAdjacentHTML('beforeend', formHtml);
      document.getElementById(formId).submit();
    }
  }

  customElements.define(customElements.component, MarketSelector);
}