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
			"game": null
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
})();