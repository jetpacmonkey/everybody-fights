
(function($) {

	var MenuView = Backbone.View.extend({
		el: '.menu',
		events: {
			'mouseover .menuItem': 'overItem',
			'mouseout': 'offMenu'
		},

		initialize: function() {
			this.highlight = this.$el.children('.menuItemHighlight');
			this.initLeft = this.highlight.position().left;
		},

		overItem: function(e) {
			var menuItem = $(e.currentTarget);
			this.highlight.stop().animate({
				'left': menuItem.position().left
			});
		},

		offMenu: function(e) {
			this.highlight.stop().animate({
				'left': this.initLeft
			});
		}
	});

	new MenuView();
})(jQuery);