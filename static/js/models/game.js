(function() {
	Game = Backbone.Model.extend({
		defaults: {
			"name": "",
			"creator": null,
			"currentPlayer": null,
			"mapObj": null,
			"gameType": "skirmish",
			"minPlayers": 2,
			"maxPlayers": 16
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