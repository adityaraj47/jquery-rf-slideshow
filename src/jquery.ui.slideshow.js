(function ( jQuery ){

jQuery.widget('ui.slideshow', {

	options: {
		transition: 'fade',
		selector: '> *',
		initialIndex: 0,
		autoStyle: true,
		autoplay: true,
		delay: 3000,
		duration: 400
	},

	_init: function(){
		if ( this.options.autoStyle ){
			if ( this.element.css('position') === 'static' ) {
				this.element.css( 'position', 'relative' );
			}
			this.element.css( 'overflow', 'hidden' );
		}
		this.transitioning = false;
		this.setup();
		if ( this.options.autoplay ) this.play();
	},

	setup: function(){
		this.slides = this.element.find( this.options.selector ).map(function( i, node ){
			return jQuery( node );
		});
		this.current = this.current || this.options.initialIndex;
		this._setupSlides();
	},

	show: function( what, options ){
		var index = ( typeof what === 'number' ) ? what : this['_' + what]();
		if ( this.transitioning || this.current === index ) return;

		var opts = jQuery.extend( {}, this.options, options ),
			trans = this._parseTransition( opts.transition ),
			next = this._prepNext( index ),
			prev = this._prepPrevious( this.current );
			eventData = {
				previous: {
					element: prev,
					index: prev.data( 'slideshow:index' )
				},
				next: {
					element: next,
					index: index
				}
			};

		this.transitioning = true;
		this.current = index;

		next.addClass( 'ui-slideshow-next' );
		prev.addClass( 'ui-slideshow-previous' );
		this.element.addClass( 'ui-slideshow-transitioning' );

		trans.args.unshift({
			previous: prev,
			next: next,
			duration: opts.duration,
			instance: this
		});

		this._trigger( 'show', null, eventData );
		_transitions[trans.name].apply( _transitions, trans.args );

		setTimeout(jQuery.proxy(function(){
			this.transitioning = false;
			next.removeClass( 'ui-slideshow-next' )
				.addClass( 'ui-slideshow-current' );
			prev.removeClass( 'ui-slideshow-previous' )
				.css( 'display', 'none' );
			this.element.removeClass( 'ui-slideshow-transitioning' );
			this._trigger( 'showComplete', null, eventData );
		}, this), opts.duration);

		return this;
	},

	play: function( now ){
		this.timer = setInterval(jQuery.proxy(function(){
			this.show( 'next' );
		}, this), this.options.delay);
		if ( now ) this.show( 'next' );
		return this;
	},

	stop: function(){
		clearInterval( this.timer );
		return this;
	},

	// private, no backwards compatibily promised, use/extend at own risk
	_parseTransition: function( transition ){
		var matches = transition.match( /(.+)(\((.+)\))|(.+)/ );
		return matches[4] ? {
			name: matches[4],
			args: []
		} : {
			name: matches[1],
			args: jQuery.map( matches[3].split( ',' ), function( arg ){
				return jQuery.trim( arg );
			})
		};
	},

	_next: function(){
		return this.current === this.slides.length - 1 ? 0 : this.current + 1;
	},

	_previous: function(){
		return this.current === 0 ? this.slides.length - 1 : this.current - 1;
	},

	_styles: { left: 0, top: 0, position: 'absolute' },

	_prepNext: function( i ){
		var slide = this.slides[i],
			style = slide.data( 'slideshow:style' ),
			css = {
				display: '',
				'z-index': 0
			};
		if ( this.options.autoStyle ) jQuery.extend( css, this._styles );
		return slide.attr( 'style', style ).css( css );
	},

	_prepPrevious: function( i ){
		this._storeStyles( i );
		return this.slides[i].css( 'z-index', 1 );
	},

	_storeStyles: function( i ){
		this.slides[i].data( 'slideshow:style', this.slides[i].attr( 'style' ) || '' );
	},

	_setupSlides: function(){
		for ( var i = 0, l = this.slides.length, slide; i < l; i++ ) {
			slide = this.slides[i];
			this._storeStyles( i );
			if ( this.options.autoStyle ) slide.css( this._styles );
			slide.css( 'display', i === this.current ? '' : 'none' );
		}
	}

});

// transition definition "static" methods
var _transitions = {};

jQuery.ui.slideshow.defineTransition = function( name, transition ){
	_transitions[name] = transition;
};

jQuery.ui.slideshow.defineTransitions = function( transitions ){
	jQuery.each( transitions, function ( name, transition ){
		jQuery.ui.slideshow.defineTransition( name, transition );
	});
};

// create transitions
jQuery.ui.slideshow.defineTransitions({

	none: function( params ){
		params.previous.css( 'display', 'none' );
	},

	fade: function( params ){
		params.previous.fadeOut( params.duration );
	}

});

})(jQuery);
