if (customElements.get('product-quantity-selector') === undefined) {
  class ProductQuantitySelector extends HTMLElement {
      constructor() {
          super();
          this.input = null;
          this.buttonPlus = null;
          this.buttonMinus = null;

          this.maxValue = null;
          this.minValue = null;
      }

      setValue(value) {
          this.input.value = value;
      }

      onInitListeners() {
          this.input.addEventListener('input', ()=>{
              if (isNaN(this.input.value) || this.input.value.includes('.') || this.input.value.includes('-')) {
                  this.input.value = this.input.value.slice(0, -1);
                  return;
              }
          })

          this.input.addEventListener('change', ()=>{
              if (+this.input.value < +this.minValue) {
                  this.input.value = this.minValue; 
                  this.buttonMinus.setAttribute('disabled', true);
                  this.buttonPlus.removeAttribute('disabled');
              } else if (+this.input.value > +this.maxValue) {
                  this.input.value = this.maxValue;
                  this.buttonPlus.setAttribute('disabled', true);
                  this.buttonMinus.removeAttribute('disabled')
              }
          })

          this.buttonPlus.addEventListener('click', ()=>{
              const updatedValue = +this.input.value + 1;
              if (updatedValue <= this.maxValue) {
                  this.setValue(updatedValue);
              }

              if (updatedValue == this.maxValue) {
                  this.buttonPlus.setAttribute('disabled', true)
              }

              if (updatedValue > this.minValue) {
                  this.buttonMinus.removeAttribute('disabled')
              }
          })

          this.buttonMinus.addEventListener('click', ()=>{
              const updatedValue = +this.input.value + -1;
              if (updatedValue >= this.minValue) {
                  this.setValue(updatedValue);
              }

              if (updatedValue == this.minValue) {
                  this.buttonMinus.setAttribute('disabled', true)
              }

              if (updatedValue < this.maxValue) {
                  this.buttonPlus.removeAttribute('disabled')
              }
          })
      }

      init() {
          this.input = this.querySelector('input[type="number"]');
          this.buttonPlus = this.querySelector('button[name="plus"]');
          this.buttonMinus = this.querySelector('button[name="minus"]');
          this.maxValue = this.input.max;
          this.minValue = this.input.min;
          this.onInitListeners();
      }

      connectedCallback() {
          document.addEventListener('DOMContentLoaded', ()=>{
              this.init();
          })
      }
  }

  customElements.define("product-quantity-selector", ProductQuantitySelector);
}