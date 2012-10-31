(function() {
	Attribute = Backbone.Model.extend({
		defaults: {
			"name": "",
			"default": null
		}
	});

	AttributeSet = BaseCollection.extend({
		model: Attribute,
		url: function() {
			return this.baseUrl + 'attribute/';
		},
		getByName: function(name) {
			var arr = this.where({"name": name});
			if (arr.length == 0) {
				return null;
			} else {
				return arr[0];
			}
		},
		initialize: function() {
			this.globalCollections.attributes = this;

			BaseCollection.prototype.initialize.call(this);
		}
	});

	Modifier = Backbone.Model.extend({
		defaults: {
			"attribute": null,
			"permanent": false,
			"effect": 0,
			"identifier": ""
		}
	});

	ModifierSet = BaseCollection.extend({
		model: Modifier,
		url: function() {
			return this.baseUrl + 'modifier/';
		},
		getByName: function(name) {
			var attribute = this.getCollection("attributes").getByName(name);
			var arr = this.where({"attribute": attribute.get("id")});
			return arr;
		},
		initialize: function () {
			if (!("modifiers" in this.globalCollections)) {
				this.globalCollections.modifiers = this;
			}

			BaseCollection.prototype.initialize.call(this);
		}
	});
})();