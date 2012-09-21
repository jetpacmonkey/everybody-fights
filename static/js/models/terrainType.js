(function() {
	TerrainType = Backbone.Model.extend({
		defaults: {
			"name": "",
			"color": "#FFFFFF"
		}
	});

	TerrainTypeSet = BaseCollection.extend({
		model: Map,
		url: function() {
			throw "No API for Terrain Types exists!";
		},
		initialize: function() {
			if (!("terrainTypes" in this.globalCollections)) {
				this.globalCollections.terrainTypes = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});


	TerrainModifier = Backbone.Model.extend({
		defaults: {
			"terrain": null,
			"attribute": null,
			"operator": "+",
			"effect": 0
		},
		applyTo: function(val) {
			var eff = this.get("effect");
			switch(this.get("operator")) {
				case "+":
					return val + eff;
				case "-":
					return val - eff;
				case "/":
					return Math.round(val / eff);
				case "*":
					return Math.round(val * eff);
			}
			console.warn("Invalid operator: " + this.get("operator"));
			return val;
		}
	});

	TerrainModifierSet = BaseCollection.extend({
		model: TerrainModifier,
		url: function() {
			throw "No API for Terrain Modifiers exists!";
		},
		initialize: function() {
			if (!("terrainModifiers" in this.globalCollections)) {
				this.globalCollections.terrainModifiers = this;
			}

			BaseCollection.prototype.initialize.call(this);
		},
		getByNameAndTerrain: function(name, terrain) {
			var attribute = this.getCollection("attributes").find(function(att) {return att.get("name") == name;});
			return this.where({
				"terrain": terrain,
				"attribute": (attribute ? attribute.get("id") : null)
			});
		}
	});


	TerrainRequirement = Backbone.Model.extend({
		defaults: {
			"terrain": null,
			"attribute": null,
			"operator": "==",
			"value": 0
		}
	});

	TerrainRequirementSet = BaseCollection.extend({
		model: TerrainRequirement,
		url: function() {
			throw "No API for Terrain Requirements exists!";
		},
		initialize: function() {
			if (!("terrainRequirements" in this.globalCollections)) {
				this.globalCollections.terrainRequirements = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});
})();