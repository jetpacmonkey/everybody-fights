(function() {
	Map = Backbone.Model.extend({
		defaults: {
			"name": "",
			"creator": null
		}
	});

	MapSet = BaseCollection.extend({
		model: Map,
		url: function() {
			return this.baseUrl + "map/";
		},
		initialize: function() {
			if (!("maps" in this.globalCollections)) {
				this.globalCollections.maps = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});
})();