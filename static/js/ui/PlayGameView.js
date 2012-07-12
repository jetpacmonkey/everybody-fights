(function() {
	var PlayGameView = BaseView.extend({
		initialize: function() {
			this.game = new Game();
			this.cells = new CellSet();
			this.gameCells = new GameCellSet();
			this.gamePlayers = new GamePlayerSet();
			this.terrainTypes = new TerrainTypeSet();

			this.load("game", "cells", "gameCells", "gamePlayers", "terrainTypes");

			BaseView.prototype.initialize.apply(this);
		}
	});

	$(function() {
		new PlayGameView();
	});
})();