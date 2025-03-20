import 'swiper/css';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

if (!customElements.get("announcement-slider")) {
  class AnnouncementBar extends HTMLElement {
    constructor() {
      super();
      this.mainSlider = this.querySelector(".announcement-blocks__swiper");
    }

    initializeSwiper() {
      const delayValue = +this.getAttribute("data-delay") || 1000;
      const speedValue = +this.getAttribute("data-speed") || 1000;
      const slideSizeCheck = this.getAttribute("data-slide-size") === "true";
      const autoplayCheck = this.getAttribute("data-autoplay") === "true";
      const autoplayValue = autoplayCheck ? { delay: delayValue, disableOnInteraction: false } : false;
      
      if (this.mainSlider) {
        // eslint-disable-next-line
        new Swiper(this.mainSlider, {
          loop: slideSizeCheck,
          allowTouchMove: slideSizeCheck,
          effect: 'slide',
          direction: 'vertical',
          centeredSlides: true,
          slidesPerView: "auto",
          modules: [Autoplay],
          freeMode: true,
          autoHeight: true,
          autoplay: autoplayValue,
          speed: speedValue
        });
      }
    }

    connectedCallback() {
      this.initializeSwiper();
    }
  }
  customElements.define("announcement-slider", AnnouncementBar);
}


