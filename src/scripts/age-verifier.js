

if (customElements.get('age-verifier') === undefined) {
  class AgeVerifier extends HTMLElement {
    constructor() {
      super();
      this.acceptButton = null;
      this.rejectButton = null;
      this.body = null;
      this.testView = null;
      this.body = null;
    }
  
    connectedCallback() {
      this.init();
    }

    init() {
      this.acceptButton = this.querySelector('.button-confirm-button');
      this.rejectButton = this.querySelector('.button-reject-button');
      this.body = document.querySelector('body');
      this.initListeners();
    };

    initListeners() {
      if (this.acceptButton) {
        this.acceptButton.addEventListener('click', (e)=>this.onButtonClick(e));
      }
  
      if (this.rejectButton) {
        this.rejectButton.addEventListener('click', (e)=>this.onButtonClick(e));
      }
  
      if (Shopify.designMode) {
        if (this.getTestView()) {
          this.onShowPopup();
        }
      } else {
        this.onShowPopup();
      }
    }

    onShowPopup() {
      this.setAttribute('show', true);
      this.body.classList.add('locked');
    };
  
    onHidePopup(){
      this.setAttribute('show', false);
      this.body.classList.remove('locked');
    };
  
    onButtonClick(e){
      e.preventDefault();
      this.onHidePopup();
      e.currentTarget.removeEventListener('click', this.onButtonClick);
      if (e.currentTarget.classList.contains('button-reject-button')) {
        if (window.history && window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      } else {
        e.currentTarget.click();
      }
    };
  
    getTestView = () => {
      testView = this.getAttribute('testing-view') === 'true';
      return testView;
    };
  }

  customElements.define('age-verifier', AgeVerifier);

  document.addEventListener('shopify:section:load', (event) => {
    const popup = event.target.querySelector('age-verifier')
    if (popup) {
      if (popup.getTestView()) {
        event.target.querySelector('age-verifier').init();
      } else {
        document.querySelector('body').classList.remove('locked');
      }
		}
  });
}