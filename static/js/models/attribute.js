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
		}
	});
})();