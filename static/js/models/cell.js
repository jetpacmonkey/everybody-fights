(function() {
	Cell = Backbone.Model.extend({
		defaults: {
			"terrain": null,
			"mapObj": null,
			"x": 0,
			"y": 0
		},

		adjacentCells: function(cells) {
			if (arguments.length === 0) {
				cells = this.collection;
			}
			var evenCol = (this.get("x") % 2) === 0;
			return _.union(
				cells.where({
					"mapObj": this.get("mapObj"),
					"x": this.get("x") - 1,
					"y": this.get("y")
				}),
				cells.where({
					"mapObj": this.get("mapObj"),
					"x": this.get("x") - 1,
					"y": this.get("y") + (evenRow ? 1 : -1)
				}),
				cells.where({
					"mapObj": this.get("mapObj"),
					"x": this.get("x") + 1,
					"y": this.get("y")
				}),
				cells.where({
					"mapObj": this.get("mapObj"),
					"x": this.get("x") + 1,
					"y": this.get("y") + (evenRow ? 1 : -1)
				})
			);
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
		},

		comparator: function(a, b) {
			if (a.get("map") != b.get("map") && "maps" in this.globalCollections) {
				var aMapName = this.globalCollections.maps.get(a.get("map")).get("name");
				var bMapName = this.globalCollections.maps.get(b.get("map")).get("name");
				if (aMapName < bMapName) {
					return -1;
				} else if (aMapName > bMapName) {
					return 1;
				}
				// if they have the same name, just sort by x and y the same as if they're the same map...
			}

			var ax = a.get("x");
			var bx = b.get("x");
			if (ax < bx) {
				return -1;
			} else if (ax == bx) {
				var ay = a.get("y");
				var by = b.get("y");
				if (ay < by) {
					return -1;
				} else if (ay == by) {
					return 0;
				} else {
					return 1;
				}
			} else {
				return 1;
			}
		}
	});
})();