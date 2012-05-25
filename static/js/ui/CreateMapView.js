(function() {
	var CreateMapView = BaseView.extend({
		initialize: function() {
			this.createdMaps = new MapSet();
			this.cells = new CellSet();
			this.terrainTypes = new TerrainTypeSet();

			this.load("createdMaps", "cells", "terrainTypes");

			BaseView.prototype.initialize.apply(this);
		}
	});

	$(function() {
		new CreateMapView();
	});
})();