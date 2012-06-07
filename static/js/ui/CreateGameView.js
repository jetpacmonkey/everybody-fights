(function() {
	var CreateGameView = BaseView.extend({
		el: ".content",
		events: {
			"click .createGame": "create"
		},
		initialize: function() {
			this.load();

			this.selView = new SettingsView();
			this.selView.mainView = this;

			BaseView.prototype.initialize.apply(this);
		},

		create: function(e) {
			if ($(e.currentTarget).hasClass("disabled")) {
				return;
			}
			var game = new Game();
			this.$(".settingsArea").each(function() {
				game.set($(this).data("field"), $(".selected", this).data("val"));
			});
			this.$(".finalSettings input").each(function() {
				game.set($(this).data("field"), $(this).val());
			});
			tmpSet = new GameSet();
			tmpSet.add(game);
			game.save({}, {
				success: function() {
					$(".loadingOverlay").show().find(".loadingText").text("Redirecting...");
					window.location = "/fight/currentGames/";
				}
			});
		}
	});

	var SettingsView = Backbone.View.extend({
		el: ".gameSettings",
		events: {
			"click .settingsOption": "selectOption",
			"click .cancelSettings": "cancelSettings"
		},
		initialize: function() {
			this.initLeftMargin = parseInt(this.$el.css("margin-left"), 10);
			this.areaInitLeft = this.$(".settingsArea:eq(1)").css("left");
			this.areaWidth = this.$(".settingsArea").outerWidth();
			this.showingConfirm = false;
		},

		filterOption: function(area) {
			if (area.data("field") == "maxPlayers") {
				var min = Number(self.$(".settingsArea.minPlayers .selected").data("val"));
				$(".settingsOption", area).show().each(function() {
					if ($(this).data("val") < min) {
						$(this).hide();
					}
				});
			}
		},

		selectOption: function(e) {
			if (this.showingConfirm) {
				return;
			}
			var self = this;
			$(e.currentTarget).addClass("selected").siblings(".selected").removeClass("selected");
			var nextArea = $(e.currentTarget).parents(".settingsArea").next(".settingsArea");
			if (nextArea.length === 0) {
				this.animateToConfirm();
			} else if (nextArea.is(":hidden")) {
				self.filterOption(nextArea);

				nextArea.css("left", self.areaInitLeft).show().animate({"left": 0}, {
					"duration": 500,
					"complete": function() {
						self.$el.animate({"margin-left": "-=" + self.areaWidth + "px"}, 200, "linear");
					}
				});

				//scroll to default
				var defaultOpt = nextArea.find(".default");
				if (defaultOpt.length) {
					nextArea.children(".settingsOptions").scrollTop(defaultOpt.position().top);
				}
			} else {
				//next area already showing, so we had already selected something here.
				//deselect everything to the right and fade out choices farther to the right than the immediate next area
				nextArea.nextAll().add(nextArea).find(".selected").removeClass("selected");
				self.filterOption(nextArea);
				nextArea.nextAll(":visible").fadeOut(200).promise().done(function() {
					self.$el.animate({"margin-left": self.initLeftMargin - self.areaWidth * (self.$(".settingsArea:visible").length - 1)}, 300);
				});

				//scroll to default
				var defaultOpt = nextArea.find(".default");
				if (defaultOpt.length) {
					nextArea.children(".settingsOptions").scrollTop(defaultOpt.position().top);
				}
			}
		},
		animateToConfirm: function() {
			this.showingConfirm = true;
			var margin = 5;
			var duration = 750;

			var self = this;
			var areas = this.$(".settingsArea");

			$(".selected", areas).css("border", "none");

			var finalHeight = areas.outerHeight() - $(".settingsOptions", areas).height() + $(".selected", areas).outerHeight() + margin;
			
			var numPerCol = Math.floor(this.$el.parent(".gameSettingsZone").height() / finalHeight);
			if (numPerCol > areas.length) {
				numPerCol = areas.length;
			}
			var vertMidpoint = numPerCol/2;
			var horMidpoint = Math.ceil(areas.length / numPerCol)/2;

			this.$el.animate({
				"margin-left": 0,
				"margin-top": 0
			}, duration);

			//start at the last one so switching to absolute position doesn't disturb others
			for (var i=areas.length - 1; i>=0; --i) {
				var area = $(areas[i]);
				var startLeft = area.position().left;

				//switch to absolute, but keep it in the same place it was to begin
				area.css({
					"position": "absolute",
					"left": startLeft + "px",
					"float": "none"
				});

				//shrink the area down to only the selected option
				$(".settingsOptions", area).animate({
					"height": $(".selected", area).outerHeight()
				}, duration);

				//shrink and then hide the non-selected options
				$(".settingsOption", area).not(".selected").animate({
					"height": 0
				}, {
					"duration": duration,
					"complete": function() {
						$(this).hide();
					}
				});

				//calculate which column we're in
				var col = Math.floor(i / numPerCol);
				//position the area
				$(area).animate({
					"left": (((col - horMidpoint) * this.areaWidth) + col * margin) + "px",
					"top": (((i % numPerCol) - vertMidpoint) * finalHeight) + "px",
					"border-width": 0
				}, duration);
			}
			areas.promise().done(function() {
				self.$el.animate({
					"margin-left": "-=" + self.areaWidth/2
				}, duration);
				var finalSettings = self.$(".finalSettings");
				var left = horMidpoint * self.areaWidth + margin * (Math.ceil(areas.length/numPerCol));
				var height = finalHeight * numPerCol - margin;
				var top = -vertMidpoint * finalHeight;
				finalSettings.css({
					"width": 0,
					"left": left + "px",
					"height": height + "px",
					"top": top + "px"
				}).show().animate({
					"width": self.areaWidth
				}, duration);
				self.mainView.$(".createGame").removeClass("disabled");
			});
		},
		cancelSettings: function() {
			var self = this;
			this.mainView.$(".createGame").addClass("disabled");
			var finalSettings = this.$(".finalSettings");
			var areas = this.$(".settingsArea");
			finalSettings.promise().done(function() {
				self.$el.fadeOut(500, function() {
					finalSettings.removeAttr("style");
					self.$el.removeAttr("style").css("margin-left", -(areas.length-1) * self.areaWidth + self.initLeftMargin);
					areas.removeAttr("style").show().css("left", 0)
						.find(".settingsOptions").removeAttr("style").find(".settingsOption").removeAttr("style");
					self.showingConfirm = false;
					$(this).hide().fadeIn(500);
				});
			});
		}
	});

	$(function() {
		new CreateGameView();
	});
})();