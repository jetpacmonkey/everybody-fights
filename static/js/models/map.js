(function() {
	Map = Backbone.Model.extend({
		defaults: {
			"name": "",
			"creator": null
		},

		getDimensions: function(cells) {
			if (arguments.length === 0) {
				cells = this.collection.getCollection("cells");
			}
			if (!this.x || !this.y) {
				var dim = findDimensions(this, cells);
				this.x = dim.x;
				this.y = dim.y;
			}
			return {"x": this.x, "y": this.y};
		},
		fillTerrain: function(terrain, cells) {
			if (arguments.length == 1) {
				cells = this.collection.getCollection("cells");
			}
			var terrainId = terrain;
			if (terrainId !== +terrainId) {
				terrainId = terrain.get("id");
			}
			var mapCells = cells.where({"mapObj": this.get("id")});
			for (var i=0; i<mapCells.length; ++i) {
				mapCells[i].set("terrain", terrainId);
			}
		},
		resize: function(options) {
			if (typeof options !== "object") {
				options = {};
			}
			if (!("x" in options) || !("y" in options)) {
				throw "Bad arguments passed, missing x or y";
			}
			if (!("cells" in options)) {
				options.cells = this.collection.getCollection("cells");
			}

			/*
			//double check that the stored dimensions are correct
			this.x = this.y = null;
			this.getDimensions(cells);
			var oldX = this.x;
			var oldY = this.y;
			var oldCells = cells.where({"mapObj": this.get("id")});

			var remove = [];
			var add = [];

			if (newX < oldX || newY < oldY) {
				//remove cells with too high of an X or Y value
				_.forEach(oldCells, function(cell) {
					if (cell.get("x") >= newX || cell.get("y") >= newY) {
						remove.push(cell);
					}
				}, this);
			}
			if (newX > oldX) {
				for (var i=oldX; i<newX; ++i) {
					for (var j=0; j<newY; ++j) {
						add.push({"x": i, "y": j, "mapObj": this.get("id")});
					}
				}
			}
			if (newY > oldY) {
				for (var j=oldY; j<newY; ++j) {
					for (var i=0; i<oldX; ++i) {
						add.push({"x": i, "y": j, "mapObj": this.get("id")});
					}
				}
			}
			cells.remove(remove);
			cells.add(add);
			*/
			var passedSuccess = options.success;
			var self = this;
			options.success = function(data) {
				var removeObjs = [];
				for (var i=0; i<data.removed.length; ++i) {
					removeObjs.push(options.cells.get(data.removed[i]));
				}

				options.cells.remove(removeObjs);
				options.cells.add(Utils_niceJSON(data.added));

				self.x = self.y = null;
				self.getDimensions(options.cells);

				if ($.isFunction(passedSuccess)) {
					passedSuccess.apply(this, arguments);
				}
			};

			$.ajax(_.extend(options, {
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				url: "/fight/api/resize/" + this.get("id") + "/" + options.x + ":" + options.y,
				data: {
					"csrfmiddlewaretoken": $("#csrf input").val()
				}
			}));
		},
		saveCells: function(opts, cellsColl) {
			if (arguments.length < 2) {
				cellsColl = this.collection.getCollection("cells");
			}
			if (typeof opts !== "object") {
				opts = {};
			}
			var mapCells = cellsColl.where({"mapObj": this.get("id")});
			var arr = [];
			for (var i=0; i<mapCells.length; ++i) {
				arr.push(mapCells[i].toJSON());
			}
			cellsColl.batchUpdate(arr, opts);
		},
		render: function(cells) {
			if (arguments.length === 0) {
				cells = this.collection.getCollection("cells");
			}
			var lastX = -1;
			var mapCells = cells.where({"mapObj": this.get("id")});
			var curCol = null;
			var mapDiv = $("<div>").addClass("map");
			_.each(mapCells, function(cell) {
				var x = cell.get("x");
				var y = cell.get("y");
				if (x != lastX) {
					if (curCol) {
						mapDiv.append(curCol);
					}
					curCol = $("<div>").addClass("mapCol");
					lastX = x;
				}
				var cellDiv = $("<div>").addClass("mapCell terrain-" + cell.get("terrain")).data({"x": x, "y": y, "cellid": cell.get("id")});
				curCol.append(cellDiv);
			}, this);
			if (curCol) {
				mapDiv.append(curCol);
			}
			mapDiv.append("<div style='clear: both'></div>");

			return mapDiv;
		}
	});

	var findDimensions = function(map, cells) {
		var lastCell = null;
		var mapId = map.get("id");

		//assume cells collection is sorted. This means the last cell that matches this map has the dimensions
		for (var i=cells.length - 1; i>=0; --i) {
			var cell = cells.at(i);
			if (cell.get("mapObj") == mapId) {
				lastCell = cell;
				break;
			}
		}

		if (lastCell) {
			return {"x": lastCell.get("x") + 1, "y": lastCell.get("y") + 1};
		} else {
			return {"x": 0, "y": 0};
		}
	}

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