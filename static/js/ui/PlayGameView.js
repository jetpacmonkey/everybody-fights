(function() {
	var PlayGameView = BaseView.extend({
		initialize: function() {
			this.game = new Game();
			this.cells = new CellSet();
			this.gameCells = new GameCellSet();

			this.load("game", "cells", "gameCells")

			BaseView.prototype.initialize.apply(this);
		}
	});

	$(function() {
		new PlayGameView();
	});
})();