(function() {
	TerrainType = Backbone.Model.extend({
		defaults: {
			"name": "",
			"color": "#FFFFFF"
		}
	});

	TerrainTypeSet = BaseCollection.extend({
		model: Map,
		url: function() {
			throw "No API for Terrain Types exists!";
		},
		initialize: function() {
			if (!("terrainTypes" in this.globalCollections)) {
				this.globalCollections.terrainTypes = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});
})();