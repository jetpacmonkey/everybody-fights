(function() {
	var CreateCharView = BaseView.extend({
		initialize: function() {
			this.attributes = new AttributeSet();
			this.createdChars = new CharacterSet();
			this.characterAttributes = new CharacterAttributeSet();

			this.load("attributes", "createdChars", "characterAttributes");

			BaseView.prototype.initialize.apply(this);
		}
	});

	$(function() {
		new CreateCharView();
	});
})();