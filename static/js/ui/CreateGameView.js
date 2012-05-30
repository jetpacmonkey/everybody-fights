(function() {
	var CreateGameView = BaseView.extend({
		initialize: function() {
			this.load();

			BaseView.prototype.initialize.apply(this);
		}
	});

	$(function() {
		new CreateGameView();
	});
})();