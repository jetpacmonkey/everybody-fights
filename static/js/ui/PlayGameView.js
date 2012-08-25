(function() {
	var PlayGameView = BaseView.extend({
		el: ".content",
		events: {
			"click .oneChar": "clickSidebarChar",
			"mouseover .mapCell": "overCell",
			"mouseout .map": "outCells",
			"click .mapCell": "clickCell"
		},

		initialize: function() {
			this.game = new Game();
			this.cells = new CellSet();
			this.gameCells = new GameCellSet();
			this.gamePlayers = new GamePlayerSet();
			this.terrainTypes = new TerrainTypeSet();
			this.characters = new CharacterSet();
			this.characterAttributes = new CharacterAttributeSet();
			this.gameCharacters = new GameCharacterSet();
			this.modifiers = new ModifierSet();
			this.attributes = new AttributeSet();
			this.cellModifiers = new CellModifierSet();
			this.characterModifiers = new CharacterModifierSet();

			this.load("game", "cells", "gameCells", "gamePlayers", "terrainTypes", "characters", "characterAttributes",
						"gameCharacters", "attributes", "modifiers", "cellModifiers", "characterModifiers");

			this.placingChar = null;

			this.apRemView = new ApMeterView();
			this.selCharView = new SelectedCharInfoView();

			this.apRemView.mainView = this.selCharView.mainView = this;

			BaseView.prototype.initialize.apply(this);
		},

		clickSidebarChar: function(e) {
			var character = this.gameCharacters.get($(e.currentTarget).data("id"));

			$(e.currentTarget).addClass("selected").siblings(".selected").removeClass("selected");
			this.selCharView.model = character;
			this.selCharView.render();
			
			if (!character.get("cell")) {
				var charIcon = $("<div>", {
					"class": "character ownedBy-" + this.gamePlayers.where({"player": user.id})[0].get("playerNum") + " character-" + this.characters.get(character.get("character")).get("id"),
					"id": "gameCharacter_" + character.get("id")
				}).data("id", character.get("id"));

				this.placingChar = {
					"character": character,
					"icon": charIcon
				};
			}
		},
		overCell: function(e) {
			if (this.placingChar && !$(".character", e.currentTarget).length) {
				$(e.currentTarget).append($(this.placingChar.icon));
			}
		},
		outCells: function(e) {
			if (this.placingChar && $(".character", e.currentTarget).length) {
				//this.placingChar.icon = $(".character", e.currentTarget).detach();
			}
		},
		clickCell: function(e) {
			var self = this;
			if (self.placingChar) {
				var cell = self.gameCells.get($(e.currentTarget).data("gamecellid"));
				self.placingChar.character.followPath([cell.get("id")], {
					success: function() {
						var moveCost = self.placingChar.character.calcAttr("moveCost");
						console.log(moveCost);
						self.apRemView.setAp("-=" + moveCost.toString());
						self.placingChar = null;
					},
					error: function(response) {
						var respTxt = response.responseText;
						alert(respTxt);
					}
				});
			}
		}
	});

	var SelectedCharInfoView = Backbone.View.extend({
		el: ".charInfo",

		render: function() {
			var self = this;
			if (this.model) {
				var character = this.mainView.characters.get(this.model.get("character"));
				this.$(".charHeader").text(character.get("name"));
				this.$(".charInfoContents .oneAttr").each(function() {
					var val = self.model.calcAttr($(this).data("attrname"));
					if (val === null) {
						$(this).hide();
					} else {
						$(this).show();
						$(".attrVal", this).text(val);
					}
				});
				this.$(".charInfoContents").css("visibility", "visible");
			} else {
				this.$(".charHeader").html("");
				this.$(".charInfoContents").css("visibility", "hidden");
			}
			return this;
		}
	});

	var ApMeterView = Backbone.View.extend({
		el: ".apArea",
		animTime: 1200,
		initialize: function() {
			var rem = $(".apRemaining", this.$el);
			rem
				.data("origWidth", rem.width())
				.width(0)
				.animate({
					width: rem.data("origWidth")
				}, this.animTime);
		},

		setAp: function(newAp) {
			var apRemSpan = $(".apRemainingDisp", this.$el);
			var oldAp = +apRemSpan.text();

			var prefix = newAp.toString().substr(0,2);
			if (prefix == "+=" || prefix == "-=") {
				var diff = +(newAp.toString().substr(2));
				if (prefix.substr(0,1) == "-") {
					newAp = oldAp - diff;
				} else {
					newAp = oldAp + diff;
				}
			}
			if (Math.floor(newAp) != newAp) {
				newAp = Math.floor(newAp);
			}
			var totalAp = this.mainView.game.get("maxAP");
			var rem = $(".apRemaining", this.$el);

			console.log(oldAp, totalAp, newAp);

			rem.animate({
				"width": (100*newAp/totalAp) + "%"
			}, this.animTime);

			var msPerAp = this.animTime/Math.abs(oldAp - newAp);
			var tmpAp = oldAp;
			var inc = (newAp < oldAp ? -1 : 1);
			var adjustByOne = function() {
				tmpAp += inc;
				apRemSpan.text(tmpAp);
				if (tmpAp != newAp) {
					window.setTimeout(adjustByOne, msPerAp);
				}
			}
			window.setTimeout(adjustByOne, msPerAp);

			return this;
		}
	});

	$(function() {
		new PlayGameView();
	});
})();