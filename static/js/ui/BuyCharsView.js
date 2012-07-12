(function() {
	var BuyCharsView = BaseView.extend({
		el: ".content",
		events: {
			"click .lockIn": "lockIn"
		},

		initialize: function() {
			this.attributes = new AttributeSet();
			this.availChars = new CharacterSet();
			this.characterAttributes = new CharacterAttributeSet();
			this.gameCharacters = new GameCharacterSet();
			this.gamePlayers = new GamePlayerSet();
			this.game = new Game();

			this.load("attributes", "availChars", "characterAttributes", "gameCharacters", "gamePlayers", "game");

			this.charInfoView = new CharInfoView();
			this.selectAvailChar = new CharSelectorView({
				"el": ".availChars"
			});
			this.selectBoughtChar = new CharSelectorView({
				"el": ".boughtChars"
			});

			this.selectAvailChar.set = this.availChars;
			this.selectBoughtChar.set = this.gameCharacters;
			this.selectBoughtChar.owner = this.gamePlayers.where({"player": user.get("id")})[0];

			this.charInfoView.mainView = this.selectAvailChar.mainView = this.selectBoughtChar.mainView = this;

			BaseView.prototype.initialize.apply(this);
		},

		lockIn: function() {
			var curGamePlayer = this.gamePlayers.where({"player": user.get("id")})[0];
			if (!curGamePlayer) {
				throw "Whaa?";
			}
			if (curGamePlayer.get("status") == "ok") {
				alert("You've already indicated you're happy with your choices.");
			} else {
				if (confirm("This will indicate that you're happy with your choices and ready for the game to begin")) {
					curGamePlayer.save({
						"status": "ok"
					}, {
						success: function() {
							window.location = "/fight/currentGames";
						}
					});
				}
			}
		}
	});

	var CharInfoView = Backbone.View.extend({
		el: ".charInfo",
		events: {
			"click .charAction": "charAction"
		},
		render: function() {
			var self = this;
			if (this.model) {
				this.$(".charHeader").text(this.model.get("name"));
				this.$(".charInfoContents .oneAttr").each(function() {
					var val = self.model.attr($(this).data("attrname"));
					if (val === null) {
						$(this).hide();
					} else {
						$(this).show();
						$(".attrVal", this).text(val);
					}
				});
				this.$(".charInfoContents").css("visibility", "visible");

				this.$(".charAction .icon, .charAction .text").removeAttr("style"); //reset everything to initial hidden state
				this.$(".charAction .wrap").show(); //make sure the wrapper isn't hiding all the button's contents
				this.$(".charAction ." + this.mode + "Char.text").show(); //show the buy/sell text
				this.$(".charAction ." + this.mode + "Char.icon").css("visibility", "visible"); //show the directional chevron (use visibility instead of display to preserve centering)
			} else {
				this.$(".charHeader").html("");
				this.$(".charInfoContents").css("visibility", "hidden");
				this.$(".charAction .wrap").hide();
			}
			return this;
		},

		charAction: function() {
			var self = this;
			if (this.mode == "buy") {
				var owner = this.mainView.gamePlayers.where({"player": user.get("id")})[0];
				if (!owner) {
					throw "No match for owner in gamePlayers. Whaa?";
				}
				var newGameChar = new GameCharacter({
					"owner": owner.get("id"),
					"character": this.model.get("id")
				});
				this.mainView.gameCharacters.add(newGameChar); //add to the bought area
				newGameChar.save({}, {
					success: function() {
						owner.set("apRemaining", owner.get("apRemaining") - self.model.attr("cost"));
						self.mainView.selectBoughtChar.render();
					},
					error: function(model, response) {
						console.error("fail", arguments);
						self.mainView.gameCharacters.remove(newGameChar);
					}
				});
			} else {
				//sell
			}
		}
	});

	var CharSelectorView = Backbone.View.extend({
		events: {
			"click .oneChar": "selectChar"
		},
		selectChar: function(e) {
			var charid = $(e.currentTarget).data("charid");
			$(".selected").removeClass("selected");
			$(e.currentTarget).addClass("selected");
			this.mainView.charInfoView.model = this.mainView.availChars.get(charid);
			this.mainView.charInfoView.mode = this.$el.data("seltype");
			this.mainView.charInfoView.render();
		},

		render: function() {
			var charsArea = this.$(".charsArea");
			var self = this;
			charsArea.empty();
			var func;
			if (this.set instanceof CharacterSet) {
				func = function(item) {
					return item;
				};
			} else if (this.set instanceof GameCharacterSet) {
				func = function(item) {
					return self.mainView.availChars.get(item.get("character"));
				};
			}
			this.set.each(function(item) {
				var character = func(item);
				var div = $("<div>").addClass("oneChar").data("charid", character.get("id")).text(character.get("name"));
				charsArea.append(div);
			});

			if (this.owner) {
				this.$(".remainingBudget").text(this.owner.get("apRemaining"));
			}

			return this;
		}
	});

	$(function() {
		new BuyCharsView();
	});
})();