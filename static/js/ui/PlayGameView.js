(function() {
	var PlayGameView = BaseView.extend({
		el: ".content",
		events: {
			"click .oneChar": "clickSidebarChar",
			"mouseenter .oneChar": "overChar",
			"mouseleave .oneChar": "outChar",
			"mouseenter .mapCell": "overCell",
			"mouseleave .mapCell": "outCell",
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
			this.pathFinder = null;

			this.apRemView = new ApMeterView();
			this.selCharView = new SelectedCharInfoView();

			this.apRemView.mainView = this.selCharView.mainView = this;

			BaseView.prototype.initialize.apply(this);
		},

		setPaths: function(gameChar) {
			this.pathFinder = PathFinder(gameChar);
			this.$(".mapCell.reachable").removeClass("reachable");
			var reachable = this.pathFinder.reachable();
			for (var i=0, ii=reachable.length; i<ii; ++i) {
				this.$("#gameCell_" + reachable[i]).addClass("reachable");
			}
		},

		clickSidebarChar: function(e) {
			var character = this.gameCharacters.get($(e.currentTarget).data("id"));

			$(e.currentTarget).addClass("selected").siblings(".selected").removeClass("selected");
			this.selCharView.model = character;
			this.selCharView.render();
			
			if (character.get("cell")) {
				this.placingChar = null;
				var id = $(e.currentTarget).data("id");
				var cellDiv = $("#gameCharacter_" + id).parent();
				$(".mapCell.selected").removeClass("selected");
				cellDiv.addClass("selected");
				this.setPaths(character);
			} else {
				var charIcon = $("<div>", {
					"class": "character ownedBy-" + this.gamePlayers.where({"player": user.id})[0].get("playerNum") + " character-" + character.get("character"),
					"id": "gameCharacter_" + character.get("id")
				}).data("id", character.get("id"));

				this.placingChar = {
					"character": character,
					"icon": charIcon
				};

				this.pathFinder = null;
			}
		},
		overChar: function(e) {
			var id = $(e.currentTarget).data("id");
			var cellDiv = $("#gameCharacter_" + id).parent();
			cellDiv.addClass("hovered");
		},
		outChar: function(e) {
			var id = $(e.currentTarget).data("id");
			var cellDiv = $("#gameCharacter_" + id).parent();
			cellDiv.removeClass("hovered");
		},
		overCell: function(e) {
			if (this.placingChar && !$(".character", e.currentTarget).length) {
				$(e.currentTarget).append($(this.placingChar.icon));
			} else if ($(".character", e.currentTarget).length) {
				var id = $(".character", e.currentTarget).data("id");
				var selDiv = $("#gameCharacterSelect_" + id);
				selDiv.addClass("hovered");
			}

			if (this.pathFinder && $(e.currentTarget).hasClass("reachable")) {
				var path = this.pathFinder.movePath($(e.currentTarget).data("gamecellid"));
				for (var i=0, ii=path.length; i<ii; ++i) {
					this.$("#gameCell_" + path[i]).addClass("inPath");
				}
				$(e.currentTarget).addClass("inPath");
			}
		},
		outCell: function(e) {
			if (this.placingChar && $(this.placingChar.icon, e.currentTarget).length) {
				this.placingChar.icon.detach();
			}
			if ($(".character", e.currentTarget).length) {
				var id = $(".character", e.currentTarget).data("id");
				var selDiv = $("#gameCharacterSelect_" + id);
				selDiv.removeClass("hovered");
			}

			this.$(".inPath").removeClass("inPath");
		},
		clickCell: function(e) {
			var self = this;
			if (self.placingChar && !$(".character", e.currentTarget).not(self.placingChar.icon).length) {
				var cell = self.gameCells.get($(e.currentTarget).data("gamecellid"));
				self.placingChar.character.followPath([cell.get("id")], {
					success: function() {
						var moveCost = self.placingChar.character.calcAttr("moveCost");
						$("#gameCharacterSelect_" + self.placingChar.character.get("id")).removeClass("unplaced");
						self.placingChar.character.set({
							"cell": cell.get("id")
						});
						self.apRemView.setAp("-=" + moveCost.toString());
						self.placingChar = null;
						$(e.currentTarget).addClass("selected");
					},
					error: function(response) {
						var respTxt = response.responseText;
						alert(respTxt);
					}
				});
			} else if ($(".character", e.currentTarget).length) {
				var id = $(".character", e.currentTarget).data("id");
				var selDiv = $("#gameCharacterSelect_" + id);
				selDiv.click();
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