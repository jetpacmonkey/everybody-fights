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
})();