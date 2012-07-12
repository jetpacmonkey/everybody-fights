
(function($) {

	var MenuView = Backbone.View.extend({
		el: '.menu',
		events: {
			'mouseover .menuItem': 'overItem',
			'mouseout': 'offMenu',
			'click .menuItem': 'clickItem'
		},

		initialize: function() {
			if (this.$el.length) {
				this.highlight = this.$el.children('.menuItemHighlight');
				this.initLeft = this.highlight.position().left;
				this.currentSub = null;
				this.subMenus = $('.subMenus', this.el);
				this.slideSpeed = 500;
			}
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
					self.subMenus.slideUp(self.slideSpeed);
				});
			} else if (this.currentSub) {
				//change submenu
				this.closeSub(this.currentSub);
				this.openSub(subName);
			} else {
				//open submenu
				var self = this;
				this.currentSub = subName;
				this.subMenus.slideDown(self.slideSpeed, function() {
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

	BaseView = Backbone.View.extend({
		el: '.content',
		initialize: function() {
			control = this;
		},
		load: function() {
			var dataBlock = $("#data");
			for (var i=0; i<arguments.length; ++i) {
				var dataInput = $("#data-" + arguments[i], dataBlock);
				if (dataInput.length === 0) {
					console.log("WARNING: Missing data input for " + arguments[i]);
					continue;
				}
				if (!(arguments[0] in this)) {
					console.log("WARNING: Missing Collection object for " + arguments[i]);
					continue;
				}
				if (this[arguments[i]] instanceof BaseCollection) {
					this[arguments[i]].reset(Utils_niceJSON(dataInput.val()));
				} else if (this[arguments[i]] instanceof Backbone.Model) {
					this[arguments[i]].set(Utils_oneNiceJSON(dataInput.val()));
				} else {
					this[arguments[i]] = $.parseJSON(dataInput.val());
				}
			}
		}
	});

	$(function() {
		new MenuView();
	});
})(jQuery);