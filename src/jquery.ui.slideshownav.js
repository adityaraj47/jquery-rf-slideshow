(function (jQuery){

jQuery.widget( 'ui.slideshownav', jQuery.ui.slideshow, {
	options: {
		selector: '> div > *',
		navSelector: '> ul > li > a',
		transition: 'push(#{direction})',
		getTransition: function( index ){
			var direction = this.current < index ? 'left' : 'right',
				transition = this.options.transition
					.replace( /#\{direction\}/g, direction );
			return { transition: transition };
		},
		autoPlay: false
	}
});

// janky, widget ought to provide some way to call super
// or some sort of method duck-punching
var proto = jQuery.ui.slideshownav.prototype,
	__setup = proto.setup;

jQuery.extend(proto, {

	setup: function(){
		var self = this;
		__setup.apply( this, arguments ); // apply super

		this.navs = this.element.find( this.options.navSelector )
			.map(function( index, node ){
				return jQuery( node ).bind( 'click.' + self.widgetEventPrefix, function( event ){
					event.preventDefault();
					self.show( index, self.options.getTransition.call( self, index ) );
				});
			});

		// would rather have events for the widget, not totally excited
		// about routing through the element ... when in Rome :\
		this.element.bind({
			// there's a good chance these event names kill kittens ;_;
			'slideshownavshow': function( event, params ){
				self.navs[params.next.index].addClass( params.instance.widgetBaseClass + '-next-nav' );
				self.navs[params.previous.index]
					.removeClass( params.instance.widgetBaseClass + '-current-nav' )
					.addClass( params.instance.widgetBaseClass + '-previous-nav' );
			},

			// another kitten just died T_T
			'slideshownavcomplete': function( event, params ){
				self.navs[params.next.index]
					.removeClass( params.instance.widgetBaseClass + '-next-nav' )
					.addClass( params.instance.widgetBaseClass + '-current-nav' );
				self.navs[params.previous.index]
					.removeClass( params.instance.widgetBaseClass + '-previous-nav' );
				
			}
		});
	}

});

})(jQuery);