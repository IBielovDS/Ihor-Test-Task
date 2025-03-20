class TabsSlider extends HTMLElement {
	constructor() {
		super();
			this.slider = null;
			this.tabs = null;
			this.hotspots = null;

			this.navigationPrevButton = null;
			this.navigationNextButton = null;

			this.sliderInstanse = null;
	}

	connectedCallback() {
		document.addEventListener('DOMContentLoaded', ()=>{
			this.init()
		})
	}

	init() {
		this.slider = this.querySelector('[data-slider]');
		this.tabs = this.querySelectorAll('[data-slider-tab]');
		this.hotspots = this.querySelectorAll('[data-slide-image-hotspot]')
		this.navigationPrevButton = this.querySelector('[data-swiper-button-prev]');
		this.navigationNextButton = this.querySelector('[data-swiper-button-next]');
		this.initSlider();
		this.initListeners();
	}
	
	initSlider() {
		const sliderOptions = {
			direction: 'horizontal',
			slidesPerView: 1,
			allowTouchMove: false
		}

		this.sliderInstanse = new Swiper(this.slider, sliderOptions)
	}

	initListeners() {
		if(this.tabs.length) {
			this.tabs.forEach((tab, index)=>tab.addEventListener('click', ()=>this.setActiveTab(index)))
		}

		if (this.hotspots.length) {
			this.hotspots.forEach(hotspot=>{
				const hotspotText = hotspot.querySelector('[data-slide-image-hotspot-text]');
				hotspot.addEventListener('mouseenter', ()=>{
					this.calculateCardPosition(hotspotText);
				})

				hotspot.addEventListener('click', ()=>{
					this.calculateCardPosition(hotspotText);
					this.setActiveHotspot(hotspot);
				})

				document.addEventListener('click', (event)=>{
					if(!event.target.classList.contains('.tabs-slider__slide-image__hotspot-circle') && !event.target.classList.contains('.tabs-slider__slide-image__hotspot')) {
						this.disableActiveHotspot();
					}
				})
			})
		}

		if (this.navigationPrevButton) {
			this.navigationPrevButton.addEventListener('click', ()=>{
				if (this.sliderInstanse.activeIndex === 0) {
					this.sliderInstanse.slideTo(this.sliderInstanse.slides.length - 1)
					this.setActiveTab(this.sliderInstanse.slides.length - 1)
				} else {
					this.sliderInstanse.slidePrev();
					this.setActiveTab(this.sliderInstanse.activeIndex);
				}
			})
		}

		if (this.navigationNextButton) {
			this.navigationNextButton.addEventListener('click', ()=>{
				if (this.sliderInstanse.activeIndex === this.sliderInstanse.slides.length - 1) {
					this.sliderInstanse.slideTo(0);
					this.setActiveTab(0);
				} else {
					this.sliderInstanse.slideNext();
					this.setActiveTab(this.sliderInstanse.activeIndex);
				}
			})
		}
	}
	
	setActiveTab(index) {
		const activeTab = [...this.tabs].find(tab=>tab.classList.contains('active'));
		if (activeTab) activeTab.classList.remove('active');
		this.tabs[index].classList.add('active');
		if (this.sliderInstanse) this.sliderInstanse.slideTo(index);
		this.disableActiveHotspot();
	}

	setActiveHotspot(hotspot) {
		this.disableActiveHotspot();
		hotspot.classList.add('active');
	}

	disableActiveHotspot() {
		const activeHotspot = [...this.hotspots].find(hotspot=>hotspot.classList.contains('active'));
		if (activeHotspot) activeHotspot.classList.remove('active');
	}

	calculateCardPosition(card) {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const containerTopBorder = this.slider.getBoundingClientRect().top + scrollTop;
		const containerBottomBorder = this.slider.getBoundingClientRect().top + this.slider.getBoundingClientRect().height + scrollTop;
		const containerLeftBorder = this.slider.getBoundingClientRect().left;
		const containerRightBorder = this.slider.getBoundingClientRect().right;
		const cardWidth = card.getBoundingClientRect().width;
		const cardHeight = card.getBoundingClientRect().height;
		const cardX = card.getBoundingClientRect().x;
		const cardY = card.getBoundingClientRect().y + scrollTop;
		let topBorderError = cardY < containerTopBorder;
		let bottomBorderError = (cardY + cardHeight) > containerBottomBorder;
		let leftBorderError = cardX < containerLeftBorder;
		let rightBorderError = (cardX + cardWidth) > containerRightBorder;

		const computedStyle = getComputedStyle(card);
		const transformValue = computedStyle.transform;
        function getTranslateValues(matrix) {
            if (!matrix || matrix === 'none') {
                return [0, 0];
            }
            const values = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');

            return [parseFloat(values[4]), parseFloat(values[5])];
        }

		const [translateX, translateY] = getTranslateValues(transformValue);

		const setYPosition = () => {
			if (topBorderError) {
				return '10%';
			} else if (bottomBorderError) {
				return `-150%`;
			}
		}

		const setXPosition = () => {
			if (leftBorderError && rightBorderError) {
				return '0%';
			} else if (leftBorderError) {
				return '51%';
			} else if (rightBorderError) {
				return '-51%';
			}
		}
		if (topBorderError || bottomBorderError || leftBorderError || rightBorderError) {
			card.style.transform = `translate(${setXPosition() ?? `${translateX}px`}, ${setYPosition() ?? `${translateY}px`})`;
		}
	}
}

if (customElements.get('tabs-slider') === undefined) {
	customElements.define('tabs-slider', TabsSlider);
	document.addEventListener('shopify:section:load', (event)=>{
		if (event.target.querySelector('tabs-slider')) {
			event.target.querySelector('tabs-slider').init();
		}
	})
}