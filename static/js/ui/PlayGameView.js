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
			var self = this;
			self.game = new Game();
			self.cells = new CellSet();
			self.gameCells = new GameCellSet();
			self.gamePlayers = new GamePlayerSet();
			self.terrainTypes = new TerrainTypeSet();
			self.terrainModifiers = new TerrainModifierSet();
			self.terrainRequirements = new TerrainRequirementSet();
			self.characters = new CharacterSet();
			self.characterAttributes = new CharacterAttributeSet();
			self.gameCharacters = new GameCharacterSet();
			self.modifiers = new ModifierSet();
			self.attributes = new AttributeSet();
			self.cellModifiers = new CellModifierSet();
			self.characterModifiers = new CharacterModifierSet();

			self.load("game", "cells", "gameCells", "gamePlayers", "terrainTypes", "terrainModifiers", "terrainRequirements",
						"characters", "characterAttributes", "gameCharacters", "attributes", "modifiers",
						"cellModifiers", "characterModifiers");

			self.curGamePlayer = self.gamePlayers.find(function(gp) {return gp.get("player") == self.game.get("currentPlayer");});
			self.userPlayer = self.gamePlayers.find(function(gp) {return gp.get("player") == user.get("id");});

			self.placingChar = null;
			self.pathFinder = null;

			self.apRemView = new ApMeterView();
			self.selCharView = new SelectedCharInfoView();
			self.actionMenuView = new ActionMenuView();

			self.apRemView.mainView = self.selCharView.mainView = self.actionMenuView.mainView = self;

			BaseView.prototype.initialize.apply(self);
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
				var cellId = $(e.currentTarget).data("gamecellid"),
					path = this.pathFinder.movePath(cellId);
				for (var i=0, ii=path.length; i<ii; ++i) {
					var pathCell = this.$("#gameCell_" + path[i]);
					pathCell.addClass("inPath");
					pathCell.attr("data-movecost", this.pathFinder.moveCost(path[i]));
				}
				$(e.currentTarget).addClass("inPath").attr("data-movecost", this.pathFinder.moveCost(cellId));
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

			this.$(".inPath").removeClass("inPath").removeAttr("data-movecost");
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
				var id = $(".character", e.currentTarget).data("id"),
					gameChar = self.gameCharacters.get(id);

				if (gameChar.get("owner") == self.userPlayer.get("id")) { //character owned by current player
					var selDiv = $("#gameCharacterSelect_" + id);
					selDiv.click();
				}
			} else if ($(e.currentTarget).hasClass("reachable")) {
				var cellId = +$(e.currentTarget).data("gamecellid"),
					cell = self.gameCells.get(cellId),
					path = self.pathFinder.movePath(cellId),
					cost = self.pathFinder.moveCost(cellId),
					gameChar = self.selCharView.model;

				gameChar.followPath(_.union(path, [cell.get("id")]), {
					success: function() {
						gameChar.set({
							"cell": cellId
						});
						self.apRemView.setAp("-=" + cost.toString());
						$(".mapCell.selected").removeClass("selected");
						$(e.currentTarget).append($("#gameCharacter_" + gameChar.get("id"))).addClass("selected");
						self.setPaths(gameChar);
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
					var base = self.model.calcBase($(this).data("attrname"))
					if (base === null) {
						$(this).hide();
					} else {
						var mod = self.model.calcMods($(this).data("attrname"), base);
						$(this).show();
						$(".attrVal", this).text(base);
						if (mod) {
							var modDiv = $(".attrMod", this);
							modDiv.text(mod).show();
							if (mod > 0) {
								modDiv.prepend("+");
							}
							if (mod < 0 == ($(this).data("attrname").toLowerCase().indexOf("cost") == -1)) { //negative value or positive cost
								modDiv.removeClass("positive").addClass("negative");
							} else {
								modDiv.removeClass("negative").addClass("positive");
							}
							$(".attrMod", this).append("=" + (base + mod).toString());
						} else {
							$(".attrMod", this).hide();
						}
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

			this.mainView.curGamePlayer.set({
				"apRemaining": newAp
			});

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

	var ActionMenuView = Backbone.View.extend({
		el: ".actionMenu",
		events: {
			"click .menuOpener": "toggleOpen",
			"click .menuAction": "action",
			"click .endTurn": "endTurn",
			"click .forfeit": "forfeit"
		},
		toggleOpen: function() {
			this.$el.toggleClass("open");
		},
		action: function() {
			this.toggleOpen();
		},
		endTurn: function() {

		},
		forfeit: function() {
			alert("Oh come on now, it's not as bad as you think.");
		}
	});

	$(function() {
		new PlayGameView();
	});
})();