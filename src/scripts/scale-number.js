if (customElements.get('scale-number') === undefined) {
  class ScaleNumber extends HTMLElement {
    constructor() {
      super();
      this.valueContainer = this.querySelector('[data-value-container]')
      this.scaleFromValue = +this.dataset.scaleFrom
      this.scaleToValue = +this.dataset.scaleTo
      this.animationSpeed = +this.dataset.animationSpeed
      this.isTriggerInView = this.dataset.triggerInView
    }
  
    runAnimation() {
      const isFloatFunction = (n) => {
        return Number(n) === n && n % 1 !== 0;
      }
      let counterElement = this.valueContainer
      let startValue = this.scaleFromValue;
      let endValue = this.scaleToValue;
      let duration = this.animationSpeed * 1000;
      let range = endValue - startValue;
      let step = Math.ceil(duration / range);
      let startTime = null;
      const isFloat = isFloatFunction(this.scaleToValue)
      function animateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let currentValue = startValue + (progress / duration) * range;
  
        if (progress < duration && currentValue <= endValue) {
          counterElement.textContent = isFloat ? currentValue.toFixed(1) : currentValue.toFixed();
          requestAnimationFrame(animateCounter);
        } else {
          counterElement.textContent = isFloat ? endValue.toFixed(1) : endValue.toFixed(0);
        }
      }
      this.classList.add('loaded')
      requestAnimationFrame(animateCounter);
    }
  
    runObserver() {
      const options = {
          root: null,
          rootMargin: '0px 0px',
          threshold: 0,
      };
  
      const callback = (entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting && !this.classList.contains('loaded')) {
                this.runAnimation();
              }
          });
      };
  
      const observer = new IntersectionObserver(callback, options);
  
      observer.observe(this);
    }
  
    initScale() {
      if (this.isTriggerInView === "true") {
        this.runObserver();
      } else {
        this.runAnimation();
      }
    }
  
    connectedCallback() {
      document.addEventListener("DOMContentLoaded", ()=>{
        this.initScale();
      })
    }
  }

  customElements.define("scale-number", ScaleNumber);
}