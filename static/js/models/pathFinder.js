(function() {
	//very basic priority queue implementation, almost definitely not optimal, but it'll work for now
	var PQ = function(highFirst) {
		if (arguments.length) {
			this.highFirst = highFirst;
		} else {
			this.highFirst = false;
		}
		this._sorted = true;
		this._data = [];
	};

	var pqSort = function() {
		if (this.highFirst) {
			// "first" isn't the most accurate description for the internal representation, since objects are popped off the back of the array.
			this._data.sort(function(a, b) {
				return a.p < b.p ? -1 : (a.p == b.p ? 0 : 1);
			});
		} else {
			this._data.sort(function(a, b) {
				return a.p > b.p ? -1 : (a.p == b.p ? 0 : 1);
			});
		}
		this._sorted = true;
	}

	PQ.prototype.constructor = PQ;
	PQ.prototype.push = function(obj, priority) {
		if (
			this._data.length
			&&
			(
				(this.highFirst && priority < this._data[this._data.length - 1].p)
				||
				(!this.highFirst && priority > this._data[this._data.length - 1].p)
			)
		) {
			this._sorted = false;
		}
		this._data.push({
			"obj": obj,
			"p": priority
		});
	};

	PQ.prototype.pop = function() {
		if (!this._sorted) {
			pqSort.call(this);
		}
		return this._data.pop().obj;
	}

	PQ.prototype.empty = function() {
		return !this._data.length;
	}

	PQ.prototype.nextPriority = function() {
		if (!this._sorted) {
			pqSort.call(this);
		}
		return this._data[this._data.length - 1].p;
	}


	//private functions
	var getCell = function(gameCell) {
			return gameCell.collection.getCollection("cells").get(gameCell.get("origCell"));
		},
		getGameCell = function(gameChar) {
			return gameChar.collection.getCollection("gameCells").get(gameChar.get("cell"));
		};


	//constructor, returns public methods
	PathFinder = function(gameChar, ap) {
		if (arguments.length < 3) {
			ap = gameChar.collection.getCollection("gamePlayers").get(gameChar.get("owner")).get("apRemaining");
		}

		var distances = {},
			calc = function() {
				distances = {}; //reset distances

				var discovered = new PQ(),
					gameCells = gameChar.collection.getCollection("gameCells");
				discovered.push({
					"gameCell": getGameCell(gameChar),
					"path": []
				}, 0);

				while (!discovered.empty() && discovered.nextPriority() <= ap) {
					var cost = discovered.nextPriority(),
						data = discovered.pop(),
						gameCell = data.gameCell,
						prevPath = data.path,
						cell,
						adjacent = [];

					if (gameCell && !(gameCell.get("id") in distances)) {
						distances[gameCell.get("id")] = {
							"cost": cost,
							"path": prevPath
						};
						cell = getCell(gameCell);

						var adjacentCells = cell.adjacentCells();

						for (var i=0, ii=adjacentCells.length; i<ii; ++i) {
							var gCell = gameCells.find(function(gc) {return gc.get("origCell") == adjacentCells[i].get("id");});
							var cellChar = gameChar.collection.find(function(gc) {return gc.get("cell") == gCell.get("id");});
							if (!cellChar && !(gCell.get("id") in distances)) { //if distance not already calculated and cell isn't occupied
								discovered.push(
									{
										"gameCell": gCell,
										"path": _.union(prevPath, [gameCell.get("id")])
									},
									cost + gameChar.calcAttr("moveCost", {
										"gameCell": gCell
									})
								);
							} //end if distance not already calculated/cell not occupied
						} //adjacentCells for loop
					} //if gameCell...
				} //while...
			};

		calc();

		return {
			"reachable": function(newAp) {
				if (newAp != ap && arguments.length) {
					ap = newAp;
					calc();
				}
				var reachable = [];
				for (var i in distances) {
					reachable.push(+i);
				}
				return reachable;
			},
			"moveCost": function(cell) {
				var cellId;
				if (cell instanceof GameCell) {
					cellId = cell.get("id");
				} else {
					cellId = cell;
				}
				if (cellId in distances) {
					return distances[cellId].cost;
				} else {
					return null;
				}
			},
			"movePath": function(cell) {
				var cellId;
				if (cell instanceof GameCell) {
					cellId = cell.get("id");
				} else {
					cellId = cell;
				}
				if (cellId in distances) {
					return distances[cellId].path;
				} else {
					return [];
				}
			},
			"getAp": function() {
				return ap;
			},
			"getDistances": function() {
				return _.clone(distances);
			}
		}
	};
})();