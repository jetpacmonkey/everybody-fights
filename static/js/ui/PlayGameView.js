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
			this.gameCharacters = new GameCharacterSet();

			this.load("game", "cells", "gameCells", "gamePlayers", "terrainTypes", "characters", "gameCharacters");

			this.placingChar = null;

			BaseView.prototype.initialize.apply(this);
		},

		clickSidebarChar: function(e) {
			var character = this.gameCharacters.get($(e.currentTarget).data("id"));
			
			if (!character.get("cell")) {
				var charIcon = $("<div>", {
					"class": "character ownedBy-" + this.gamePlayers.where({"player": user.id})[0].get("playerNum") + " character-" + this.characters.get(character.get("character")).get("id")
				});

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

	$(function() {
		new PlayGameView();
	});
})();