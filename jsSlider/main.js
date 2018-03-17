class Carousel {
    /**
    * @param {HTMLElement} element
    * @param {Object} options
    * @param {Object} [options.slidesToScroll]
    * @param {Object} [options.slidesVisible]
    * @param {Object} [options.loop=false]
    * @param {Object} [options.infinite=false]
    * @param {Object} [options.pagination=false]
    * @param {Object} [options.naviagation=true]
    */
    constructor(element, options = {}){
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 3,
            loop: false,
            pagination: false,
            navigation: false,
            infinite: false
        }, options)

        if(this.options.loop && this.options.infinite) {
            throw new Error("A carousel can not be both loop and infinite")
        }

        let children = [].slice.call(element.children)
        this.isMobile = false
        this.currentItem = 0
        
        // Create Dom structure

        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
        this.root.setAttribute('tabindex', '0')
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)

        this.moveCallbacks = []
        this.offset = 0

        this.items = children.map(child => {
            let item = this.createDivWithClass('carousel__item')
            item.appendChild(child)
            return item
        })
        if(this.options.infinite) {
            this.offset = this.options.slidesVisible + this.options.slidesToScroll
            if ( this.offset > children.length ){
                console.error("You do not have enough element in the carousel", element)
            }
            this.items = [
                ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
                ...this.items,
                ...this.items.slice(0, this.offset ).map(item => item.cloneNode(true))
            ]
            this.goToItem(this.offset, false)
    
        }
        this.items.forEach(item => this.container.appendChild(item))
        this.setStyle()
        if(this.options.navigation){
            this.createNavigation()
        }
        if(this.options.pagination){
            this.createPagination()
        }
        
        // Event Listeners
        this.moveCallbacks.forEach(cb => cb(this.currentItem))
        this.onWindowResize()
        window.addEventListener('resize', this.onWindowResize.bind(this))
        this.root.addEventListener('keyup', e => {
            if(e.key === 'ArrowRight' || e.key === 'Right' ){
                this.next()
            } else if(e.key === 'ArrowLeft' || e.key === 'Left' ){
                this.prev()
            }
        })
        if(this.options.infinite) {
            this.container.addEventListener('transitionend', this.resetInfinite.bind(this))
        }
    }
    /**
    * Set style for carousel items and adjust navigation
    */
    setStyle() {
        let ratio = this.items.length / this.slidesVisible
        this.container.style.width = ( ratio * 100 ) + "%"
        this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio) + "%")
    }

    createNavigation(){
        let nextButton = this.createDivWithClass('carousel__next')
        let prevButton = this.createDivWithClass('carousel__prev')
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))

        if(this.options.loop === false){
            return
        }

        this.onMove(index => {
            if(index === 0) {
                prevButton.classList.add('carousel__prev--hidden')
            } else {
                prevButton.classList.remove('carousel__prev--hidden')
            }
            if(this.items[this.currentItem + this.slidesVisible] === undefined) {
                nextButton.classList.add('carousel__next--hidden')
            } else {
                nextButton.classList.remove('carousel__next--hidden')
            }
        })
    }
    createPagination(){
        let pagination = this.createDivWithClass('carousel__pagination')
        let buttons = []
        this.root.appendChild(pagination)
        for(let i = 0; i < (this.items.length - 2 * this.offset ); i = i + this.options.slidesToScroll){
            let button = this.createDivWithClass('carousel__pagination__button')
            button.addEventListener('click', () => {
                this.goToItem(i + this.offset)
            })
            pagination.appendChild(button)
            buttons.push(button)
        }
        this.onMove(index => {
            let count = this.items.length - 2 * this.offset
            let activeButton = buttons[Math.floor(((index - this.offset) % count ) / this.options.slidesToScroll)]
            if( activeButton ) {
                buttons.forEach(button => button.classList.remove('carousel__pagination__button--active'))
                activeButton.classList.add('carousel__pagination__button--active')
            }
        })
    }

    next() {
        this.goToItem(this.currentItem + this.slidesToScroll)
    }

    prev() {
        this.goToItem(this.currentItem - this.slidesToScroll)
    }
    /**
    * @param {number} index
    * @param {boolean} animation
    */
    goToItem(index, animation = true) {
        if(index < 0) {
            if(this.options.loop) {
                index = this.items.length - this.options.slidesVisible
            }else{
                return
            } 
        } else if(index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && index > this.currentItem ) ) {
            if(this.options.loop){
                index = 0
            } else {
                return
            }
        }
        let translateX = index * -100 / this.items.length
        if(animation === false) {
            this.container.style.transition = 'none'
        }
        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)'
        this.container.offsetHeight
        if(animation === false) {
            this.container.style.transition = ''
        }
        this.currentItem = index
        this.moveCallbacks.forEach(cb => cb(index))
    }

    resetInfinite() {
        if( this.currentItem <= this.options.slidesToScroll ){
            this.goToItem( this.currentItem + (this.items.length - 2 * this.offset), false )
        } else if (this.currentItem >= this.items.length - this.offset ) {
            this.goToItem( this.currentItem - (this.items.length - 2 * this.offset), false )
        }
    }
    /**
    * @param {Carouselmove~Callback}
    */
    onMove(cb) {
        this.moveCallbacks.push(cb)
    }

    onWindowResize (){
        let mobile = window.innerWidth < 800
        if(mobile !== this.isMobile) {
            this.isMobile = mobile
            this.setStyle()
        }
    }

    /**
    * @param {string} className
    * @return {HTMLElement}
    */
    createDivWithClass(className) {
        let div = document.createElement('div')
        div.setAttribute('class', className)
        return div
    }
    /**
    * @return {number}
    */
    get slidesToScroll(){
        return this.isMobile ? 1 : this.options.slidesToScroll
    }
    /**
    * @return {number}
    */
    get slidesVisible(){
        return this.isMobile ? 1 : this.options.slidesVisible
    }
}

let onReady = function(){
    
        new Carousel(document.querySelector('#carousel0'),{
            slidesToScroll: 1,
            slidesVisible: 3,
            navigation: true
        })
        new Carousel(document.querySelector('#carousel1'),{
            slidesToScroll: 1,
            slidesVisible: 2,
            pagination: true,
            loop: true
        })
        new Carousel(document.querySelector('#carousel2'),{
            slidesToScroll: 1,
            slidesVisible: 3,
            pagination: true,
            infinite: true,
            navigation: true
        })
    
}
if(document.readyState !== 'loading') {
    onReady()
}

document.addEventListener('DOMContentLoaded', onReady )

