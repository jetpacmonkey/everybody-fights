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
		calcAttr: function(attrName, opts) {
			if (arguments.length < 2) {
				opts = {};
			}

			var character = null;
			if ("characters" in this.collection.globalCollections) {
				character = this.collection.getCollection("characters").get(this.get("character"));
			}
			if (!character) {
				console.error("Character not found");
				return null;
			}
			var val = character.attr(attrName);
			if (val === null) {
				return null; //not a valid attribute for this character type
			}

			var cellId;
			if ("gameCell" in opts) {
				if (opts.gameCell instanceof GameCell) {
					cellId = opts.gameCell.get("id");
				} else {
					cellId = opts.gameCell;
				}
			} else {
				cellId = this.get("cell");
			}
			var cellMods = this.collection.getCollection("cellModifiers").getByNameAndCell(attrName, cellId);
			for (var i=0, ii=cellMods.length; i<ii; ++i) {
				var mod = this.collection.getCollection("modifiers").get(cellMods.get("modifier"));
				val += mod.get("effect");
			}
			var charMods = this.collection.getCollection("characterModifiers").getByNameAndCharacter(attrName, this.get("character"));
			for (var i=0, ii=charMods.length; i<ii; ++i) {
				var mod = this.collection.getCollection("modifiers").get(cellMods.get("modifier"));
				val += mod.get("effect");
			}
			return val;
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
