(function() {
	var CreateCharView = BaseView.extend({
		initialize: function() {
			this.attributes = new AttributeSet();

			this.load("attributes");

			BaseView.prototype.initialize.apply(this);
		}
	});

	$(function() {
		new CreateCharView();
	});
})();