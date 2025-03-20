/**
 * Zoom Image Functionality
 *
 * Overview:
 * This script defines a custom HTML element `<zoom-image>` that allows users to zoom in on an image by clicking on it. 
 * The zoomed image is displayed as a background overlay, allowing for detailed inspection of the image as the user moves their cursor.
 *
 * Key Components:
 *
 * 1. **ZoomImage Class:**
 *    - Extends `HTMLElement` to create a custom HTML element representing the zoomable image.
 *    - Handles the initialization, event listeners, and interactions required to zoom in and out of the image.
 *
 * 2. **Zoom Functionality:**
 *    - **`turnOnZoom(image)`:** Activates the zoom by setting the background size of the overlay to be a magnified version of the image 
 *      and displaying the overlay.
 *    - **`turnOffZoom()`:** Deactivates the zoom by hiding the overlay and resetting the zoom state.
 *    - **`zoomOnCenter(image)`:** Centers the zoom on the image, positioning the background to the center of the overlay.
 *    - **`moveWithHover(image, event, overlay)`:** Updates the position of the zoomed image within the overlay based on the cursor's 
 *      position, allowing the user to explore different parts of the image.
 *
 * 3. **Overlay Creation:**
 *    - **`createOverlay(image)`:** Creates an overlay element that displays the zoomed-in version of the image. 
 *      This overlay is positioned above the original image and responds to user interactions.
 *    - **`prepareOverlay(container, image)`:** Prepares the overlay container with the necessary attributes and styles 
 *      to display the zoomed image.
 *
 * 4. **Event Listeners:**
 *    - **Click Event:** 
 *      - Toggles the zoom on and off when the user clicks on the image.
 *    - **Mousemove Event:** 
 *      - Moves the zoomed image within the overlay as the user hovers their cursor over the image.
 *    - **Mouseleave Event:** 
 *      - Hides the overlay when the user moves the cursor away from the image if the zoom is not active.
 *    - **Slider Integration:** 
 *      - If the zoom image is part of a slider, the zoom is automatically turned off when the slide changes, ensuring that the zoomed 
 *        state is reset for each slide.
 *
 * 5. **Custom Elements Registration:**
 *    - The `ZoomImage` class is registered as a custom element `<zoom-image>`, ensuring it can be used anywhere in the DOM.
 *
 * Usage:
 * - This script is automatically applied to all `<zoom-image>` elements in the DOM.
 * - Ensure that the image to be zoomed is correctly nested within the `<zoom-image>` element for the functionality to work as expected.
 */

if (customElements.get('zoom-image') === undefined) {
  class ZoomImage extends HTMLElement {
    constructor() {
        super();
        this.defaultZoomValue = 3;
        this.container = null;
        this.image = null;
        this.inZoom = false;
    }
  
    turnOnZoom(image) {
        this.container.style.backgroundSize = `${image.width * this.defaultZoomValue}px`;
        this.container.classList.add('active');
        this.inZoom = true;
    }
  
    turnOffZoom() {
        this.container.classList.remove('active');
        this.inZoom = false;
    }
  
    zoomOnCenter(image) {
        this.turnOnZoom(image)
        this.container.style.backgroundPosition = `${50}% ${50}%`;
        this.container.style.backgroundSize = `${image.width * this.defaultZoomValue}px`;
    }
  
    prepareOverlay(container, image) {
        container.setAttribute('class', 'image-magnify-full-size');
        container.setAttribute('aria-hidden', 'true');
        container.style.backgroundImage = `url('${image.src}')`;
        this.container = container;
        this.image = image;
    }
  
    createOverlay(image) {
        if (!image) return
        const overlayImage = document.createElement('img');
        const src = image.src
        overlayImage.setAttribute('src', `${src}`);
        let overlay = document.createElement('div');
        this.prepareOverlay(overlay, overlayImage);
        image.parentElement.insertBefore(overlay, image);
        return overlay;
    }
    
    moveWithHover(image, event, overlay) {
        const ratio = image.height / image.width;
        const container = event.target.getBoundingClientRect();
        const xPosition = event.clientX - container.left;
        const yPosition = event.clientY - container.top;
        const xPercent = `${xPosition / (image.clientWidth / 100)}%`;
        const yPercent = `${yPosition / ((image.clientWidth * ratio) / 100)}%`;
        overlay.style.backgroundPosition = `${xPercent} ${yPercent}`;
        overlay.style.backgroundSize = `${image.width * this.defaultZoomValue}px`;
    }
  
    magnify(image) {
        this.createOverlay(image);
    }
  
    initListeners() {
        const image = this.querySelector('img');
        if (!image) return
        this.magnify(image);
        if (this.slider) {
            this.slider.addEventListener('slide-change', ()=>{
                const activeZoomImage = this.slider.querySelectorAll('.image-magnify-full-size.active');
                if (activeZoomImage.length) {
                    activeZoomImage.forEach(zoomImage=>{
                        const zoomWrapper = zoomImage.closest('zoom-image');
                        zoomWrapper.turnOffZoom();
                    })
                }
            })
        }
  
        this.addEventListener('click', ()=>{
            if (this.classList.contains('magnify-zoom-image-wrapper')) {
                const overlay = this.querySelector('.image-magnify-full-size');
                const image = this.querySelector('img');
                if (overlay.classList.contains('active')) {
                    this.turnOffZoom(image);
                } else {
                    this.turnOnZoom(image);
                }
            }
        })
  
        this.addEventListener('mousemove', (event)=>{
            if (this.classList.contains('magnify-zoom-image-wrapper') && this.inZoom) {
                const overlay = this.querySelector('.image-magnify-full-size')
                const image = this.querySelector('img');
                
                this.moveWithHover(image, event, overlay);
            }
        })
        
        this.addEventListener('mouseleave', ()=>{
            if (this.classList.contains('magnify-zoom-image-wrapper') && this.inZoom == false) {
                const overlay = this.querySelector('.image-magnify-full-size')
                overlay.classList.remove('active');
            }
        })
    }
  
    init() {
        this.slider = this.closest('custom-slider')
        this.initListeners();
    }
  
    connectedCallback() {
        this.init();
    }
  }

  customElements.define("zoom-image", ZoomImage);
}
