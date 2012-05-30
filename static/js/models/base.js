(function($, undefined) {
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
		},
		batchUpdate: function(models, options) {
			if (!options) {
				options = {};
			}
			var params = {
				type: "PUT",
				dataType: 'json',
				data: JSON.stringify({"objects": models}),
				contentType: "application/json"
			};
			if (!options.url) {
				params.url = this.url();
			}
			$.ajax(_.extend(params, options));
		}
	});

	Backbone.Model.prototype.builtinUrl = Backbone.Model.prototype.url;
	Backbone.Model.prototype.url = function() {
		var defUrl = this.builtinUrl();
		return defUrl + (defUrl.charAt(defUrl.length - 1) == "/" ? "" : "/");
	};

	var loadCounter = 0;
	var loadingOverlay = $("#loadingOverlay");
	var beforeLoad = function() {
		++loadCounter;
		loadingOverlay.show();
	};
	var afterLoad = function() {
		--loadCounter;
		if (loadCounter < 0) {
			loadCounter = 0;
		}
		if (loadCounter === 0) {
			loadingOverlay.hide();
		}
	};

	$("body").on("ajaxSend", beforeLoad).on("ajaxComplete", afterLoad);
})(jQuery);