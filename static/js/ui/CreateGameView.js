(function() {
	var CreateGameView = BaseView.extend({
		initialize: function() {
			this.load();

			this.selView = new SettingsView();
			this.selView.mainView = this;

			BaseView.prototype.initialize.apply(this);
		}
	});

	var SettingsView = Backbone.View.extend({
		el: ".gameSettings",
		events: {
			"click .settingsOption": "selectOption"
		},
		initialize: function() {
			this.initLeft = this.$el.position().left;
			this.areaInitLeft = this.$(".settingsArea:eq(1)").css("left");
			this.areaWidth = this.$(".settingsArea").outerWidth();
		},

		selectOption: function(e) {
			var self = this;
			$(e.currentTarget).addClass("selected").siblings(".selected").removeClass("selected");
			var nextArea = $(e.currentTarget).parents(".settingsArea").next();
			if (nextArea.is(":hidden")) {
				nextArea.css("left", self.areaInitLeft).show().animate({"left": 0}, {
					"duration": 500,
					"complete": function() {
						var startLeft = self.$el.position().left;
						self.$el.css("left", startLeft);
						self.$el.animate({"left": "-=" + self.areaWidth + "px"}, 200, "linear");
					}
				});
			} else {
				//next area already showing, so we had already selected something here.
				//deselect everything to the right and fade out choices farther to the right than the immediate next area
				nextArea.nextAll().find(".selected").removeClass("selected");
				nextArea.nextAll(":visible").fadeOut(200).promise().done(function() {
					self.$el.animate({"left": self.initLeft - self.areaWidth * (self.$(".settingsArea:visible").length - 1)}, 300, "linear");
				});
			}
		}
	});

	$(function() {
		new CreateGameView();
	});
})();