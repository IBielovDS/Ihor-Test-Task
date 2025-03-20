customElements.component = "custom-dropdown";

if (!customElements.get(customElements.component)) {
  class CustomDropdown extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.initState();
      this.initSelectors();
      this.initListeners();
      this.updateSelectedValue();
      this.updateCheckIcons();
    }

    initState() {
      this.select = null;
      this.selectedValue = null;
      this.handleDocumentClick = this.handleDocumentClick.bind(this);
      this.page = this.dataset.page;
    }

    initSelectors() {
      this.select = this.querySelector("select");
      this.selectChangers = this.querySelectorAll('[data-action="change-sort"]');
      this.selectedValue = this.querySelector('.selected-value span');
    }

    initListeners() {
      this.addEventListener("click", (event) => {
        event.stopPropagation();
        this.toggleTargetClass(this, "open", !this.classList.contains("open"));
      });

      document.addEventListener("click", this.handleDocumentClick);

      if (this.selectChangers.length) {
        this.selectChangers.forEach((changer) => {
          changer.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            this.select.value = changer.value;

            this.selectChangers.forEach(input => {
              input.checked = input.value === changer.value;
            });

            const labelValue = changer.closest('label').querySelector('.label-value').textContent;
            if (this.selectedValue) {
              this.selectedValue.textContent = labelValue;
            }

            this.updateCheckIcons(changer.value);

            this.toggleTargetClass(this, "open", false);

            this.select.dispatchEvent(new Event("change"));

            if (this.page === 'brand') {
              const brandsPage = this.closest('brands-page');
              if (brandsPage) {
                brandsPage.handleSort({ target: this.select });
              }
            }
          });
        });
      }
    }

    updateSelectedValue() {
      if (this.select && this.selectedValue) {
        const selectedOption = this.select.options[this.select.selectedIndex];
        this.selectedValue.textContent = selectedOption.textContent;
      }
    }

    updateCheckIcons(selectedValue = null) {
      if (!selectedValue) {
        selectedValue = this.select.value;
      }

      this.querySelectorAll('label').forEach(label => {
        const input = label.querySelector('input');
        const svg = label.querySelector('svg');

        if (svg) {
          if (input.value === selectedValue) {
            svg.classList.remove('hidden');
          } else {
            svg.classList.add('hidden');
          }
        }
      });
    }

    handleDocumentClick(event) {
      if (!this.contains(event.target)) {
        this.toggleTargetClass(this, "open", false);
      }
    }

    toggleTargetClass(target, className, flag) {
      target.classList.toggle(className, flag);
    }

    disconnectedCallback() {
      document.removeEventListener("click", this.handleDocumentClick);
    }
  }

  customElements.define(customElements.component, CustomDropdown);
}