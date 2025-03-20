

if (customElements.get('main-collection') === undefined) {
  class MainCollection extends HTMLElement {
    constructor() {
      super();
      this.sortingDropdown = null;
    }
  
    replaceProducts(content) {
      this.querySelector('.main-collection__grid').innerHTML = content.querySelector('.main-collection__grid').innerHTML
      if (this.querySelector('.custom-pagination')) {
        if (window.initCustomPagination) {
          window.initCustomPagination();
        }
      }
    }
  
    replaceFilters(content) {
      const openedFilters = [...this.querySelectorAll('details')].map(detail=>detail.open == true ? detail.dataset.filter : false).filter(Boolean);
      if (openedFilters.length) {
        openedFilters.forEach(filter=>{
          content.querySelector(`[data-filter="${filter}"]`).open = true;
        })
      }
      this.querySelector('.main-collection__filters').innerHTML = content.querySelector('.main-collection__filters').innerHTML
  
      if (this.querySelector('price-range')) {
        this.querySelector('price-range').init();
      }
    }
  
    replaceFiltersBar(content) {
      this.querySelector('.main-collection__filters-bar').innerHTML = content.querySelector('.main-collection__filters-bar').innerHTML
    }
  
    requestFilteredCollection(url) {
      this.classList.add('loading');
      fetch(`${url}${url.includes('?') ? "&" : "?"}section_id=${this.dataset.originalSection}`)
        .then((response) => response.text())
        .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            const content = html.querySelector('main-collection');
            this.replaceProducts(content);
            this.replaceFilters(content);
            this.replaceFiltersBar(content);
            this.replaceUrl(url);
            this.init();
            this.classList.remove('loading');
        });
    }
  
    replaceUrl(url) {
      window.history.replaceState({}, '', url);
  
      if (window.location.search.includes('filter.v.price')) {
        this.querySelector('price-range').updateInputs();
      }
    }
  
    changeUrl(key, value, type = "set") {
      let url = new URL(window.location.href);
  
      switch (type) {
        case 'set':
          url.searchParams.set(key, `${value}`);
          break;
        case 'append':
          url.searchParams.append(key, `${value}`);
          break;
        case 'delete':
          url.searchParams.delete(key, `${value}`);
          break;
      }
  
      url.searchParams.has('page') ? url.searchParams.set('page', 1) : null;
      return url = url.toString();
    }
  
    initListeners() {
      if (this.sortingDropdown) {
        const sortingRadioInputs = this.sortingDropdown.querySelectorAll('input[type="radio"]');
        if (sortingRadioInputs.length) {
          sortingRadioInputs.forEach(input=>{
            input.addEventListener('change', ()=>{
              const activeInput = [...sortingRadioInputs].find(input=>input.classList.contains('active'))
              activeInput ? activeInput.classList.remove('active') : "";
              input.classList.add('active');
              const key = 'sort_by';
              const value = input.value
              const requestUrl = this.changeUrl(key, value, 'set');
              this.requestFilteredCollection(requestUrl)
            })
          })
        }
      }
  
      if (this.filterCheckboxes.length) {
        this.filterCheckboxes.forEach(input=>{
          input.addEventListener('change', ()=>{
              const key = input.name;
              const value = input.value;
              let requestUrl = null;
              if (input.classList.contains('active')) {
                input.classList.remove('active');
                requestUrl = this.changeUrl(key, value, 'delete');
              } else {
                input.classList.add('active');
                requestUrl = this.changeUrl(key, value, 'append');
              }
              this.requestFilteredCollection(requestUrl);
          })
        })
      }
  
      if (this.resetFilterLinks.length) {
        this.resetFilterLinks.forEach(link=>{
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const resetUrl = link.getAttribute('href');
            this.requestFilteredCollection(resetUrl);
            this.replaceUrl(resetUrl);
          })
        })
      }
  
      if (this.priceRangeMin && this.priceRangeMax) {
        this.priceRangeMin.addEventListener('change', ()=>{
            const key = this.priceRangeMin.name;
            const value = this.priceRangeMin.value;
            const requestUrl = this.changeUrl(key, value, 'set');
            this.requestFilteredCollection(requestUrl);
        })
  
        this.priceRangeMax.addEventListener('change', ()=>{
            const key = this.priceRangeMax.name;
            const value = this.priceRangeMax.value;
            const requestUrl = this.changeUrl(key, value, 'set');
            this.requestFilteredCollection(requestUrl);
        })
      }
  
      if (this.filterPopup && this.filterButtonPopup) {
        this.filterPopup.addEventListener('click', (e)=>{
          if (e.target === this.filterPopup) {
            this.hidePopup();
          }
        })
  
        if (this.filterButtonPopup) {
          this.filterButtonPopup.addEventListener('click', (e)=>{
            e.preventDefault();
            this.showPopup();
          })
        }
        
  
        if (this.filterPopupSubmit) {
          this.filterPopupSubmit.addEventListener('click', (e)=>{
            e.preventDefault();
            this.hidePopup();
          })
        }
        
  
        if (this.filterPopupClose) {
          this.filterPopupClose.addEventListener('click', (e)=>{
            e.preventDefault();
            this.hidePopup();
          })
        }
        
      }
    }
  
    showPopup() {
      document.querySelector('body').classList.add('locked')
      this.filterPopup.classList.remove('hidden')
      this.filterPopup.setAttribute('open', true)
    }
  
    hidePopup() {
      document.querySelector('body').classList.remove('locked')
      this.filterPopup.removeAttribute('open')
      setTimeout(()=>{
        this.filterPopup.classList.add('hidden')
      }, 300)
    }
  
    init() {
      this.sortingDropdown = this.querySelector('details[data-filter="Sorting"]');
      this.filterCheckboxes = this.querySelectorAll('.main-collection__filters input[type="checkbox"]');
      this.resetFilterLinks = this.querySelectorAll('a[data-reset-filters]');
      this.priceRangeMin = this.querySelector('.main-collection__filters .filter-group-display__price-range-from');
      this.priceRangeMax = this.querySelector('.main-collection__filters .filter-group-display__price-range-to');
      this.filterPopup = this.querySelector('.main-collection__filters--wrapper');
      this.filterButtonPopup = this.querySelector('button[data-open-filters-sidebar]');
      this.filterPopupSubmit = this.querySelector('button[data-submit-filters]');
      this.filterPopupClose = this.querySelector('[data-close-popup]');
      this.initListeners();
    }
  
    connectedCallback() {
      document.addEventListener('DOMContentLoaded', ()=>{
        this.init();
      })
    }
  }

  customElements.define("main-collection", MainCollection);

  document.addEventListener('shopify:section:load', (e)=>{
    if(e.target.querySelector('main-collection')) {
        e.target.querySelector('main-collection').init();
    }
})
}

