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
			self.hoverInfoView = new HoverInfoView();

			self.apRemView.mainView =
				self.selCharView.mainView =
				self.actionMenuView.mainView =
				self.hoverInfoView.mainView =
				self;

			BaseView.prototype.initialize.apply(self);
		},

		setPaths: function(gameChar) {
			var self = this;
			if (self.curGamePlayer == self.userPlayer) {
				this.pathFinder = PathFinder(gameChar);
				this.$(".mapCell.reachable").removeClass("reachable");
				var reachable = this.pathFinder.reachable();
				for (var i=0, ii=reachable.length; i<ii; ++i) {
					this.$("#gameCell_" + reachable[i]).addClass("reachable");
				}
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
				this.$(".mapCell.reachable").removeClass("reachable");
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
			var self = this,
				cellDiv = $(e.currentTarget);
			if (self.placingChar && !$(".character", cellDiv).length) {
				cellDiv.append($(self.placingChar.icon));
			} else if ($(".character", cellDiv).length) {
				var id = $(".character", cellDiv).data("id");
				var selDiv = $("#gameCharacterSelect_" + id);
				selDiv.addClass("hovered");

				if (!self.placingChar && self.selCharView.model && self.gameCharacters.get(id).get("owner") != self.selCharView.model.get("owner")) {
					var selCharCell = self.cells.get(self.gameCells.get(self.selCharView.model.get("cell")).get("origCell")),
						adjCells = selCharCell.adjacentCells(),
						attackCellId = self.cells.get(self.gameCells.get(cellDiv.data("gamecellid")).get("origCell")).get("id"),
						attackCost;
					if (_.find(adjCells, function(c) {return c.get("id") == attackCellId})) { //check if clicked cell is one of the adjacent ones
						attackCost = self.selCharView.model.calcAttr("meleeAttackCost");
					} else { //not adjacent, must be ranged
						attackCost = self.selCharView.model.calcAttr("rangeAttackCost");
					}
					if (attackCost !== null) { //if it's an attack that this character is capable of
						cellDiv.append($("<div>").addClass("target")).addClass("targeted").attr("data-movecost", attackCost);
					}
				}
				self.hoverInfoView.show(self.gameCharacters.get(id), $(e.currentTarget).offset());
			}

			if (self.pathFinder && cellDiv.hasClass("reachable")) {
				var cellId = $(e.currentTarget).data("gamecellid"),
					path = self.pathFinder.movePath(cellId);
				for (var i=0, ii=path.length; i<ii; ++i) {
					var pathCell = self.$("#gameCell_" + path[i]);
					pathCell.addClass("inPath");
					pathCell.attr("data-movecost", self.pathFinder.moveCost(path[i]));
				}
				cellDiv.addClass("inPath").attr("data-movecost", self.pathFinder.moveCost(cellId));
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

				$(".target", e.currentTarget).remove();
				$(e.currentTarget).removeClass("targeted").removeAttr("data-movecost");

				this.hoverInfoView.hide();
			}

			this.$(".inPath").removeClass("inPath").removeAttr("data-movecost");
		},
		clickCell: function(e) {
			var self = this,
				clickedCell = $(e.currentTarget);
			if (self.placingChar && !$(".character", clickedCell).not(self.placingChar.icon).length) {
				var cell = self.gameCells.get(clickedCell.data("gamecellid"));
				self.placingChar.character.followPath([cell.get("id")], {
					success: function() {
						var moveCost = self.placingChar.character.calcAttr("moveCost");
						$("#gameCharacterSelect_" + self.placingChar.character.get("id")).removeClass("unplaced");
						self.placingChar.character.set({
							"cell": cell.get("id")
						});
						self.apRemView.setAp("-=" + moveCost.toString());
						self.setPaths(self.placingChar.character);
						self.placingChar = null;
						$(e.currentTarget).addClass("selected");
					},
					error: function(response) {
						var respTxt = response.responseText;
						alert(respTxt);
					}
				});
			} else if ($(".character", clickedCell).length) {
				var id = $(".character", clickedCell).data("id"),
					gameChar = self.gameCharacters.get(id)

				if (gameChar.get("owner") == self.userPlayer.get("id")) { //character owned by current player
					var selDiv = $("#gameCharacterSelect_" + id);
					selDiv.click();
				} else if ($(e.currentTarget).hasClass("targeted")) { //character owned by an opponent and we have an attacker selected, ATTAAAAAACK!!
					var selChar = self.selCharView.model;
					selChar.attack(gameChar, {
						success: function(response) {
							var damInd = $("<div>").addClass("damageIndicator").text(response.damage);
							clickedCell.append(damInd);
							self.hoverInfoView.show();

							self.apRemView.setAp("-=" + response.attackCost);
							window.setTimeout(function() {
								damInd.addClass("fading");
								window.setTimeout(function() {
									damInd.remove();
									if (!response.health) {
										$(".character", clickedCell).remove();
									}
								}, 300);
							}, 500);
						},
						error: function(response) {
							var respTxt = response.responseText;
							alert(respTxt);
						}
					});
				}
			} else if (clickedCell.hasClass("reachable")) {
				var cellId = +clickedCell.data("gamecellid"),
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
						clickedCell.append($("#gameCharacter_" + gameChar.get("id"))).addClass("selected");
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
			$.ajax({
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				url: "/fight/api/endTurn/" + this.mainView.game.get("id") + "/",
				data: {
					"csrfmiddlewaretoken": $("#csrf input").val()
				},
				success: function() {
					window.location = '/fight/currentGames';
				},
				error: function(response) {
					var respTxt = response.responseText;
					alert(respTxt);
				}
			});
		},
		forfeit: function() {
			alert("Oh come on now, it's not as bad as you think.");
		}
	});

	var HoverInfoView = Backbone.View.extend({
		el: ".hoverInfo",
		initialize: function() {
			this.origPlayerClass = this.$(".playerName").attr("class");
		},
		show: function(gameCharacter, pos) {
			if (!arguments.length) {
				gameCharacter = this.model;
				pos = null;
			}

			var self = this,
				character = self.mainView.characters.get(gameCharacter.get("character")),
				hp = gameCharacter.calcAttr("health")
				maxHp = character.attr("health"),
				owner = self.mainView.gamePlayers.get(gameCharacter.get("owner"));

			self.model = gameCharacter;

			self.$(".playerName").attr("class", self.origPlayerClass).addClass("gamePlayer-" + owner.get("playerNum"));
			self.$(".charName").text(character.get("name"));
			self.$(".health").text(hp);
			self.$(".maxHealth").text(maxHp);

			if (pos) {
				self.$el.addClass("open").css(pos);
				if (pos.top < 95) {
					self.$el.addClass("onBottom");
				} else {
					self.$el.removeClass("onBottom");
				}
			}
		},
		hide: function() {
			this.$el.removeClass("open");
		}
	})

	$(function() {
		new PlayGameView();
	});
})();