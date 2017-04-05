function Slider(container){
   this.container = container;
   this.imgs = this.container.find('img');
   this.imgWidth = this.imgs[0].width;
   this.imgLen = this.imgs.length;
   this.current = 0;
}

Slider.prototype.transition = function(coords){
   this.container.animate({
      'margin-left' : coords || -(this.current * this.imgWidth)
   })
}
Slider.prototype.setCurrent = function(dir){
   var pos = this.current;
   pos += (~~(dir === 'next') || -1);
   this.current = ( pos < 0) ? this.imgLen - 1 : pos % this.imgLen;
   return pos;
}
Slider.prototype.styler = function(height){
   this.container.wrap('<div class="slider-wrap" />').parent().css('overflow' , 'hidden')
   .parent().append('<div class="slider-nav"><button data-dir="prev" class="btn btn-default">Previous</button><button data-dir="next" class="btn btn-default">Next</button>');
   this.container.css({
      'width' : '99999px',
      'position' : 'relative',
      'padding' : 0,
      'height' : height
   });
   this.container.children().css({
      'float' : 'left',
      'width' : this.container.parent().width()
   });
   this.imgs.css({
      'height' : height
   })
}
