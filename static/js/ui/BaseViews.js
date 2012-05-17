
(function($) {

	var MenuView = Backbone.View.extend({
		el: '.menu',
		events: {
			'mouseover .menuItem': 'overItem',
			'mouseout': 'offMenu',
			'click .menuItem': 'clickItem'
		},

		initialize: function() {
			this.highlight = this.$el.children('.menuItemHighlight');
			this.initLeft = this.highlight.position().left;
			this.currentSub = null;
			this.subMenus = $('.subMenus', this.el);
		},

		overItem: function(e) {
			var menuItem = $(e.currentTarget);
			this.highlight.stop().animate({
				'left': menuItem.position().left
			});
		},

		offMenu: function(e) {
			if (this.currentSub) {
				var self = this;
				var lightLeft = this.initLeft;
				$(this.el).children('.menuItem').each(function() {
					if ($(this).data('submenu') == self.currentSub) {
						lightLeft = $(this).position().left;
						return false;
					}
				});
				this.highlight.stop().animate({
					'left': lightLeft
				});
			} else {
				this.highlight.stop().animate({
					'left': this.initLeft
				});
			}
		},

		clickItem: function(e) {
			var subName = $(e.currentTarget).data("submenu");
			if (this.currentSub == subName) {
				//close submenu
				var self = this;

				this.closeSub(subName);
				$(":animated", this.subMenus).queue(function(next) {
					self.subMenus.slideUp(1000);
				});
			} else if (this.currentSub) {
				//change submenu
				this.closeSub(this.currentSub);
				this.openSub(subName);
			} else {
				//open submenu
				var self = this;
				this.currentSub = subName;
				this.subMenus.slideDown(1000, function() {
					self.openSub(subName);
				});
			}
		},

		closeSub: function(subName) {
			var $sub = $(".subMenu.subMenu-" + subName, this.subMenus);
			$sub.stop().animate({
				'left': '-100%'
			});
			if (this.currentSub == subName) {
				this.currentSub = null;
			}
		},

		openSub: function(subName) {
			var $sub = $(".subMenu.subMenu-" + subName, this.subMenus);
			$sub.stop().animate({
				'left': '0'
			});
			this.currentSub = subName;
		}
	});

	$(function() {
		new MenuView();
	});
})(jQuery);