(function() {
	Cell = Backbone.Model.extend({
		defaults: {
			"terrain": null,
			"mapObj": null,
			"x": 0,
			"y": 0
		}
	});

	CellSet = BaseCollection.extend({
		model: Cell,
		url: function() {
			return this.baseUrl + "cell/";
		},
		initialize: function() {
			if (!("cells" in this.globalCollections)) {
				this.globalCollections.cells = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});
})();