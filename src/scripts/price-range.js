if (customElements.get('price-range') === undefined) {
  class PriceRage extends HTMLElement {
    constructor() {
      super();
      this.sortingDropdown = null;
      this.minRange = null;
      this.maxRange = null;
      this.minValueInput = null;
      this.maxValueInput = null;
      this.track = null;
    }

    validateInput(input) {
      input.value = input.value.replace(/[^0-9.]/g, '');
      const value = input.value;

      if (value.startsWith("0") && value.length > 1 && !value.startsWith("0.")) {
        input.value = value.substring(1);
      }

      if ((value.match(/\./g) || []).length > 1 || value.indexOf('.') === 0) {
        input.value = value.slice(0, -1);
      }

      if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1].length > 2) {
          input.value = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }

      const numericValue = parseFloat(input.value);
      const min = parseFloat(input.getAttribute('min'));
      const max = parseFloat(input.getAttribute('max'));

      if (isNaN(numericValue) || numericValue < min) {
        input.value = min.toFixed(2);
      } else if (numericValue > max) {
        input.value = max.toFixed(2);
      }
    }

    updateTrack() {
      const min = parseFloat(this.minRange.value);
      const max = parseFloat(this.maxRange.value);
      const rangeMax = parseFloat(this.minRange.max);
      const minPercent = (min / rangeMax) * 100;
      const maxPercent = (max / rangeMax) * 100;
      this.track.style.left = minPercent + '%';
      this.track.style.width = (maxPercent - minPercent) + '%';
    }

    updateInputs() {
      this.minValueInput.value = parseFloat(this.minRange.value).toFixed(2);
      this.maxValueInput.value = parseFloat(this.maxRange.value).toFixed(2);
      const changeEvent = new Event('input');
      this.updateTrack();
      this.minValueInput.dispatchEvent(changeEvent);
      this.maxValueInput.dispatchEvent(changeEvent);
    }

    initListeners() {
      if (this.minRange) {
        this.minRange.addEventListener('input', ()=> {
          if (parseInt(this.minRange.value) > parseInt(this.maxRange.value)) {
            this.minRange.value = this.maxRange.value;
          }
          this.updateInputs();
        });

        this.minRange.addEventListener('change', () => {
          this.minValueInput.value = parseFloat(this.minRange.value).toFixed(2);
          this.minValueInput.dispatchEvent(new Event('change'));
        });
      }

      if (this.maxRange) {
        this.maxRange.addEventListener('input', () =>{
          if (parseInt(this.maxRange.value) < parseInt(this.minRange.value)) {
            this.maxRange.value = this.minRange.value;
          }
          this.updateInputs();
        });

        this.maxRange.addEventListener('change', () => {
          this.maxValueInput.value = parseFloat(this.maxRange.value).toFixed(2);
          this.maxValueInput.dispatchEvent(new Event('change'));
        });
      }

      if (this.minValueInput) {
        this.minValueInput.addEventListener('input', () => {
          this.validateInput(this.minValueInput);
          this.minRange.value = this.minValueInput.value;
          if (parseInt(this.minValueInput.value) > parseInt(this.maxValueInput.value)) {
            this.maxValueInput.value = this.minValueInput.value;
            this.maxRange.value = this.minValueInput.value;
          }
          this.updateTrack();
        });
      }

      if (this.maxValueInput) {
        this.maxValueInput.addEventListener('input', () => {
          this.validateInput(this.maxValueInput);
          this.maxRange.value = this.maxValueInput.value;
          if (parseInt(this.maxValueInput.value) < parseInt(this.minValueInput.value)) {
            this.minValueInput.value = this.maxValueInput.value;
            this.minRange.value = this.maxValueInput.value;
          }
          this.updateTrack();
        });
      }
      this.updateTrack();
    }

    init() {
      this.minRange = this.querySelector('#minRange');
      this.maxRange = this.querySelector('#maxRange');
      this.minValueInput = this.querySelector('.filter-group-display__price-range-from');
      this.maxValueInput = this.querySelector('.filter-group-display__price-range-to');
      this.track = this.querySelector('#price-range-track');
      this.initListeners();
    }

    connectedCallback() {
      document.addEventListener('DOMContentLoaded', ()=>{
        this.init();
      })
    }
  }

  customElements.define("price-range", PriceRage);

  document.addEventListener('shopify:section:load', (e)=>{
      if(e.target.querySelector('price-range')) {
          e.target.querySelector('price-range').init();
      }
  })
}