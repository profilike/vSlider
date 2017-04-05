(function($){

   $.fn.vSlider = function(options){
      var defaults = {
         speed: 1500,
         pause: 3000,
         height: 460,
         transition: 'nav'
      },
      options = $.extend(defaults, options);
      if(options.pause <= options.speed) options.pause = options.speed + 100;

      var imgs = $("#slider").find('img'),
          imgWidth = imgs[0].width,
          imgLen = imgs.length,
          current = 1,
          totalImgWidth =  imgLen * imgWidth;

      this.each(function(){
         var $this = $(this);
         $this.wrap('<div class="slider-wrap" />').parent().css('overflow' , 'hidden');

         /*
            STYLE
         */
         $this.css({
            'width' : '99999px',
            'position' : 'relative',
            'padding' : 0,
            'height' : options.height
         });
         $this.children().css({
            'width' : $this.parent().width()
         });
         imgs.css({
            'height' : options.height
         })

         /*
            SLIDE EFFECT
         */

         if(options.transition === 'slide'){
            $this.children().css({
               'float' : 'left',

            });
            slide();
         }
         function slide(){
            setInterval(function(){
               $this.animate({'left' : '-' + $this.parent().width() }, options.speed, function(){
                  $this
                     .css('left' , 0 )
                     .children(':first')
                     .appendTo($this);
               })
            }, options.pause);
         }
         /*
            FADE EFFECT
         */

         if(options.transition === 'fade'){

            $this.children().css({
               'position' : 'absolute',
               'left' : 0
            });
            for(var i = imgLen - 1, y = 0; i >= 0; i--, y++ ){
               $this.children().eq(y).css('zIndex', i + 999);
            }
            fade();
         }
         function fade(){
            setInterval(function(){
               $this.children(':first').animate({'opacity' : 0}, options.speed, function(){
                  $this
                     .children(':first')
                     .css('opacity' , 1)
                     .css('zIndex', $this.children(':last').css('zIndex') - 1)
                     .appendTo($this);
               })
            }, options.pause);
         }

         /*
            NAV
         */
        if(options.transition === 'nav'){

           $('.slider-wrap').append('<div class="slider-nav"><button data-dir="prev" class="btn btn-default">Previous</button><button data-dir="next" class="btn btn-default">Next</button>');

             $this.children().css({
                'float' : 'left',
             });
            $('.slider-nav').find('button').on('click', function(){
               var direction = $(this).attr('data-dir'),
               loc = imgWidth;
               // update current value
               (direction === 'next' ) ? ++current : --current;

               if( current === 0 ){
                  current = imgLen;
                  loc = totalImgWidth - imgWidth;
                  direction = 'next';
               }else if( current - 1 === imgLen ){
                  current = 1;
                  loc = 0;
               }
               transition($("#slider"), loc, direction);
            });
            function transition(container, loc, direction){
               var unit;
               if(direction && loc !== 0){
                  unit = (direction === 'next') ? '-=' : '+=';
               }
               container.animate({
                  'margin-left': unit ? (unit + loc) : loc
               })
            }
          }

      });


   }

})(jQuery);
