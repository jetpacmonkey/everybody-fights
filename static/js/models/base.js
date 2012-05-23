(function($) {
	BaseCollection = Backbone.Collection.extend({
		baseUrl: '/fight/api/v1/',
		globalCollections: {},
		initialize: function() {
			this.relatedCollections = {};
		},
		getCollection: function(cName) {
			if (cName in this.relatedCollections) {
				return this.relatedCollections[cName];
			} else {
				return this.globalCollections[cName];
			}
		}
	});

	Backbone.Model.prototype.builtinUrl = Backbone.Model.prototype.url;
	Backbone.Model.prototype.url = function() {
		var defUrl = this.builtinUrl();
		return defUrl + (defUrl.charAt(defUrl.length - 1) == "/" ? "" : "/");
	};
})(jQuery);