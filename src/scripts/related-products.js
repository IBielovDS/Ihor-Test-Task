customElements.component = "product-recommendations";

if (!customElements.get(customElements.component)) {
  class ProductRecommendations extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
      this.activeGroup = "all";
      this.progressBar = null;
      this.mobileThumbs = null;
      this.prevButton = null;
      this.nextButton = null;
      this.slides = null;
    }

    connectedCallback() {
      const handleIntersection = async (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);

        try {
          const response = await fetch(this.dataset.url);
          const text = await response.text();

          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector("product-recommendations");

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
            this.initializeSlider();
          }
        } catch (error) {
          console.error("Error fetching recommendations:", error);
          this.classList.remove("is-loading");
        }
      };

      new IntersectionObserver(handleIntersection.bind(this), { rootMargin: "0px 0px 400px 0px" }).observe(this);
    }

    initializeSlider() {
      this.progressBar = this.querySelector(".product-slider__desktop-progress");
      this.mobileThumbs = this.querySelector(".product-slider__mobile-thumbs");
      this.prevButton = this.querySelector(".product-slider__desktop-nav__prev");
      this.nextButton = this.querySelector(".product-slider__desktop-nav__next");
      this.slides = this.querySelectorAll(".swiper-wrapper .swiper-slide");

      const swiperOptions = {
        slidesPerView: 1.15,
        spaceBetween: 0,
        grabCursor: true,
        watchSlidesProgress: true,
        pagination: {
          el: this.mobileThumbs,
          clickable: true,
          type: "bullets",
          dynamicBullets: true,
        },
        navigation: {
          prevEl: this.prevButton,
          nextEl: this.nextButton,
        },
        breakpoints: {
          768: {
            slidesPerView: 2.2,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 3.74,
            spaceBetween: 0,
          },
        },
        on: {
          init: () => {
            setTimeout(() => this.updateProgressBar(), 0);
          },
          slideChange: () => this.updateProgressBar(),
        },
      };

      this.swiper = new Swiper(this.querySelector(".swiper"), swiperOptions);
      this.classList.remove("is-loading");
    }

    updateProgressBar() {
      if (!this.progressBar || !this.swiper) return;

      try {
        const visibleSlides = this.getVisibleSlides();
        const totalSlides = visibleSlides.length;
        const slidesPerView = this.swiper.params?.slidesPerView || 1;

        const maxPossibleIndex = Math.max(0, totalSlides - Math.ceil(slidesPerView));

        if (maxPossibleIndex <= 0) {
          this.progressBar.style.display = "none";
          if (this.prevButton) this.prevButton.style.display = "none";
          if (this.nextButton) this.nextButton.style.display = "none";
          return;
        }

        this.progressBar.style.display = "";
        if (this.prevButton) this.prevButton.style.display = "";
        if (this.nextButton) this.nextButton.style.display = "";

        const currentIndex = this.swiper.activeIndex || 0;
        const singleSlidePercent = (1 / maxPossibleIndex) * 100;
        let progress = singleSlidePercent + (currentIndex / maxPossibleIndex) * (100 - singleSlidePercent);

        progress = Math.max(singleSlidePercent, Math.min(100, progress));

        currentIndex >= maxPossibleIndex && (progress = 100);

        this.progressBar.innerHTML = `
        <div class="progress-bar">
          <div class="progress" style="width: ${progress}%"></div>
        </div>
      `;
      } catch (error) {
        console.warn("Error updating progress bar:", error);
      }
    }

    getVisibleSlides() {
      return this.slides;
    }

    disconnectedCallback() {
      if (this.swiper) {
        this.swiper.destroy();
      }
    }
  }

  customElements.define(customElements.component, ProductRecommendations);
}
