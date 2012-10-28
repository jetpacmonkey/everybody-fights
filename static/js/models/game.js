(function() {
	Game = Backbone.Model.extend({
		defaults: {
			"name": "",
			"creator": null,
			"currentPlayer": null,
			"mapObj": null,
			"gameType": "skirmish",
			"minPlayers": 2,
			"maxPlayers": 16,
			"maxAP": 20,
			"gamePhase": 0,
			"budget": 50,
			"turnNum": 1
		}
	});

	GameSet = BaseCollection.extend({
		model: Game,
		url: function() {
			return this.baseUrl + 'game/';
		},
		initialize: function() {
			if (!("games" in this.globalCollections)) {
				this.globalCollections.games = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});

	GamePlayer = Backbone.Model.extend({
		"game": null,
		"player": null,
		"playerNum": 1,
		"apRemaining": 0
	});

	GamePlayerSet = BaseCollection.extend({
		model: GamePlayer,
		url: function() {
			return this.baseUrl + 'gamePlayer/';
		},
		initialize: function() {
			if (!("gamePlayers" in this.globalCollections)) {
				this.globalCollections.gamePlayers = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});

	GameCharacter = Backbone.Model.extend({
		defaults: {
			"character": null,
			"cell": null,
			"owner": null
		},
		initialize: function() {
			this.tmpHealthMod = 0;
		},
		followPath: function(path, opts) {
			var passedSuccess = opts.success;
			var self = this;
			opts.success = function(data) {
				//not sure if anything will need to be added here...

				if ($.isFunction(passedSuccess)) {
					passedSuccess.apply(this, arguments);
				}
			};

			$.ajax(_.extend(opts, {
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				url: "/fight/api/move/" + this.get("id") + "/" + path.join(":"),
				data: {
					"csrfmiddlewaretoken": $("#csrf input").val()
				}
			}));
		},
		damage: function(damageDone) {
			var self = this;
			if (!self.initHealth) {
				self.initHealth = self.calcAttr("health");
			}

			self.tmpHealthMod -= damageDone;
			if (self.tmpHealthMod < -self.initHealth) { //got rid of more health than we actually have (so it should be 0)
				self.tmpHealthMod = -self.initHealth;
			}
			console.log(self.initHealth, self.tmpHealthMod);
		},
		attack: function(target, opts) {
			var passedSuccess = opts.success;
			var self = this;
			opts.success = function(data) {
				console.log(data);

				target.damage(data.damage);

				if ($.isFunction(passedSuccess)) {
					passedSuccess.apply(this, arguments);
				}
			};

			$.ajax(_.extend(opts, {
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				url: "/fight/api/attack/" + self.get("id") + ":" + target.get("id"),
				data: {
					"csrfmiddlewaretoken": $("#csrf input").val()
				}
			}));
		},
		calcAttr: function(attrName, opts) {
			if (arguments.length < 2) {
				opts = {};
			}

			var base = this.calcBase(attrName, opts);
			if (base === null) {
				return null;
			}
			return base + this.calcMods(attrName, base, opts);
		},
		calcBase: function(attrName) {
			var character = null;
			if ("characters" in this.collection.globalCollections) {
				character = this.collection.getCollection("characters").get(this.get("character"));
			}
			if (!character) {
				console.error("Character not found");
				return null;
			}
			return character.attr(attrName);
		},
		calcMods: function(attrName, base, opts) {
			if (arguments.length < 3) {
				opts = {};
				if (arguments.length < 2) {
					base = 0;
				}
			}

			var val = base;

			var cellId, gameCell;
			if ("gameCell" in opts) {
				if (opts.gameCell instanceof GameCell) {
					gameCell = opts.gameCell;
					cellId = opts.gameCell.get("id");
				} else {
					cellId = opts.gameCell;
					gameCell = this.collection.getCollection("gameCells").get(cellId);
				}
			} else {
				cellId = this.get("cell");
				gameCell = this.collection.getCollection("gameCells").get(cellId);
			}
			
			if (gameCell) {
				var cell = this.collection.getCollection("cells").get(gameCell.get("origCell"));
				var cellTerrainMods = this.collection.getCollection("terrainModifiers").getByNameAndTerrain(attrName, cell.get("terrain"));
				for (var i=0, ii=cellTerrainMods.length; i<ii; ++i) {
					val = cellTerrainMods[i].applyTo(val);
				}
				var cellMods = this.collection.getCollection("cellModifiers").getByNameAndCell(attrName, cellId);
				for (var i=0, ii=cellMods.length; i<ii; ++i) {
					var mod = this.collection.getCollection("modifiers").get(cellMods.get("modifier"));
					val += mod.get("effect");
				}
			}
			var charMods = this.collection.getCollection("characterModifiers").getByNameAndCharacter(attrName, this.get("character"));
			for (var i=0, ii=charMods.length; i<ii; ++i) {
				var mod = this.collection.getCollection("modifiers").get(cellMods.get("modifier"));
				val += mod.get("effect");
			}

			if (this.tmpHealthMod && attrName == "health") {
				val += this.tmpHealthMod;
			}

			return val - base;
		}
	});

	GameCharacterSet = BaseCollection.extend({
		model: GameCharacter,
		url: function() {
			return this.baseUrl + 'gameCharacter/';
		},
		initialize: function() {
			if (!("gameCharacters" in this.globalCollections)) {
				this.globalCollections.gameCharacters = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});

	GameCell = Backbone.Model.extend({
		defaults: {
			"origCell": null,
			"game": null
		}
	});

	GameCellSet = BaseCollection.extend({
		model: GameCell,
		url: function() {
			return this.baseUrl + 'gameCell/';
		},
		initialize: function() {
			if (!("gameCells" in this.globalCollections)) {
				this.globalCollections.gameCells = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});

	CellModifier = Backbone.Model.extend({
		defaults: {
			"cell": null,
			"modifier": null
		}
	});

	CellModifierSet = BaseCollection.extend({
		model: CellModifier,
		url: function() {
			return this.baseUrl + 'cellModifier/';
		},
		initialize: function() {
			if (!("cellModifiers" in this.globalCollections)) {
				this.globalCollections.cellModifiers = this;
			}

			BaseCollection.prototype.initialize.call(this);
		},
		getByNameAndCell: function(attrName, cell) {
			if (cell instanceof GameCell) {
				cell = cell.get("id");
			}
			var result = [];
			var modifiers = this.getCollection("modifiers").getByName(attrName);
			for (var i=0, ii=modifiers.length; i<ii; ++i) {
				result = result.concat(this.where({
					"modifier": modifiers[i].get("id"),
					"cell": cell
				}));
			}
			return result;
		}
	});

	CharacterModifier = Backbone.Model.extend({
		defaults: {
			"character": null,
			"modifier": null
		}
	});

	CharacterModifierSet = BaseCollection.extend({
		model: CellModifier,
		url: function() {
			return this.baseUrl + 'characterModifier/';
		},
		initialize: function() {
			if (!("characterModifiers" in this.globalCollections)) {
				this.globalCollections.characterModifiers = this;
			}

			BaseCollection.prototype.initialize.call(this);
		},
		getByNameAndCharacter: function(attrName, character) {
			if (character instanceof GameCharacter) {
				character = character.get("id");
			}
			var result = [];
			var modifiers = this.getCollection("modifiers").getByName(attrName);
			for (var i=0, ii=modifiers.length; i<ii; ++i) {
				result = result.concat(this.where({
					"modifier": modifiers[i].get("id"),
					"character": character
				}));
			}
			return result;
		}
	});
})();
