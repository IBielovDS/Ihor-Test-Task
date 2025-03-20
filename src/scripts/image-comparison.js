/**
 * Image Comparison Widget Functionality
 *
 * Overview:
 * This script defines a custom HTML element `<image-comparison>` that allows users to compare two images 
 * by dragging a slider horizontally. The widget visually demonstrates the differences between two images 
 * by adjusting the width of the overlaid image as the slider is moved.
 *
 * Key Components:
 *
 * 1. **ImageComparison Class:**
 *    - Extends `HTMLElement` to create a custom HTML element representing the image comparison widget.
 *    - Handles initialization, event listeners, and interactions with the widget.
 *
 * 2. **Initialization (`init`):**
 *    - The `init` method initializes key elements within the widget:
 *      - **`divider`:** The slider that the user drags to compare images.
 *      - **`dividerCircle`:** The circle on the slider for user interaction.
 *      - **`leftImage`:** The left image that is revealed or hidden as the slider moves.
 *      - **`leftImageWrapper`:** The wrapper for the left image.
 *      - **`leftImageContent`:** The content within the left image wrapper.
 *    - The widget's width is adjusted based on the current viewport size (`onChangeImageWidth`).
 *    - Event listeners for user interactions are set up through the `initComparisonListeners` method.
 *    - The widget responds to window resize events to maintain proper alignment and size of images.
 *
 * 3. **Slide Movement Logic:**
 *    - **`slideReady`:** Prepares the widget for sliding when the user begins to drag the slider.
 *    - **`slideMove`:** Adjusts the width of the left image and the position of the slider as the user drags.
 *    - **`slideFinish`:** Ends the sliding interaction and removes event listeners.
 *    - The position of the cursor relative to the widget is calculated by `getCursorPos`, which determines 
 *      how much of the left image should be shown.
 *
 * 4. **Event Listeners:**
 *    - **Mouse and Touch Events:**
 *      - `mousedown`, `touchstart`: Start the sliding interaction.
 *      - `mouseup`, `touchend`: End the sliding interaction.
 *      - `mousemove`, `touchmove`: Move the slider and adjust image width during interaction.
 *    - **Resize Event:** Adjusts the width of the left image to ensure correct display on different screen sizes.
 *    - **`disconnectedCallback`:** Cleans up event listeners when the widget is removed from the DOM.
 *
 * 5. **Custom Elements Registration:**
 *    - The `ImageComparison` class is registered as a custom element `<image-comparison>`, ensuring it can be used 
 *      anywhere in the DOM.
 *
 * 6. **Shopify Section Handling:**
 *    - The script listens for the `shopify:section:load` event to reinitialize the widget when a section containing 
 *      the image comparison element is loaded.
 *
 * Usage:
 * - This script is automatically applied to all `<image-comparison>` elements in the DOM.
 * - Ensure that the images and the slider are correctly set up within the HTML structure to achieve the desired effect.
 */

class ImageComparison extends HTMLElement {
  constructor() {
    super();
    this.clicked = false;
    this.cursorPosition = 0;
    this.initialPosition = 0;
  }

  initComparisonListeners() {
    if (this.divider && this.dividerCircle) {
      this.dividerCircle.addEventListener('mousedown', (e) => this.slideReady(e));
      this.dividerCircle.addEventListener('mouseup', (e) => this.slideFinish(e));
      this.dividerCircle.addEventListener('touchstart', (e) => this.slideReady(e));
      this.dividerCircle.addEventListener('touchend', (e) => this.slideFinish(e));
      document.addEventListener('mouseup', (e) => this.slideFinish(e));
    }
  }

  slideReady(e) {
    e.preventDefault();
    this.getCursorPos(e);
    this.clicked = true;
    this.addEventListener('mousemove', (e) => this.slideMove(e));
    this.addEventListener('touchmove', (e) => this.slideMove(e));
  }

  slideFinish(e) {
    this.clicked = false;
    this.removeEventListener('mousemove', (e) => this.slideMove(e));
    this.removeEventListener('touchmove', (e) => this.slideMove(e));
  }

  slideMove(e) {
    if (!this.clicked) return false;
    const dynamicPosition = this.getCursorPos(e);
    const direction = this.initialPosition - dynamicPosition;
    const wrapperWidth = this.getBoundingClientRect().width;
    const dividerPosition = ((dynamicPosition / wrapperWidth) * 100).toFixed(3);
    if (direction > 0) {
      if (dividerPosition <= 100 && dividerPosition >= 0) {
        this.leftImageWrapper.style.width = `${Math.abs(dividerPosition)}%`;
      }
    } else {
      if (dividerPosition <= 100 && dividerPosition >= 0) {
        this.leftImageWrapper.style.width = `${Math.abs(dividerPosition)}%`;
      }
    }
    if (dividerPosition <= 100 && dividerPosition >= 0) {
      this.divider.style.left = `${dividerPosition}%`;
    }
  }

  getCursorPos(event) {
    let xCoordinate = 0;
    const moveEvent = event.changedTouches ? event.changedTouches[0] : event;
    const imagePosition = this.getBoundingClientRect();
    xCoordinate = moveEvent.pageX - imagePosition.left;
    xCoordinate = xCoordinate - window.pageXOffset;
    if (!this.clicked) {
      this.initialPosition = xCoordinate;
    }
    return xCoordinate;
  }

  onChangeImageWidth() {
    this.leftImage.style.width = `${this.getBoundingClientRect().width}px`;
    this.leftImageContent.style.width = `${this.getBoundingClientRect().width}px`;
  }

  init() {
    this.divider = this.querySelector('.image-comparison__slider-divider');
    this.dividerCircle = this.querySelector('.image-comparison__slider-divider__circle');
    this.leftImage =
      this.querySelector('.image-comparison__left-image img') ||
      this.querySelector('.image-comparison__left-image svg');
    this.leftImageWrapper = this.querySelector('.image-comparison__left-image');
    this.leftImageContent = this.querySelector('.image-comparison__left-image__content');
    this.onChangeImageWidth();
    this.initComparisonListeners();
    window.addEventListener('resize', () => this.onChangeImageWidth());
  }

  disconnectedCallback() {
    window.removeEventListener('resize', () => this.onChangeImageWidth());
  }

  connectedCallback() {
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }
}

if (customElements.get('image-comparison') === undefined) {
  customElements.define('image-comparison', ImageComparison);
}

document.addEventListener('shopify:section:load', (event) => {
  const comparisonWidget = event.target.querySelector('image-comparison');
  if (comparisonWidget) {
    comparisonWidget.init();
  }
});