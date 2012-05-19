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
			return this.baseUrl + 'attribute'
		},
		getByName: function(name) {
			var arr = this.where({"name": name});
			if (arr.length == 0) {
				return null;
			} else {
				return arr[0];
			}
		}
	});

	Modifier = Backbone.Model.extend({
		defaults: {
			"attribute": null,
			"permanent": false,
			"effect": 0
		}
	})
})();