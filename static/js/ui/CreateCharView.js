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

	var EditViewChar = Backbone.View.extend({
		el: ".charZones",
		events: {
			"click .saveChar": "saveChar"
		},
		initialize: function() {
			this.mainView = null;
			this.curChar = null;
			this.inputs = this.$("input");
		},
		render: function() {
			this.inputs.val("");
			if (this.curChar) {
				this.inputs.prop("disabled", false);
				var attrs = this.mainView.characterAttributes.where({"character": this.curChar.get("id")});
				for (var i=0; i<attrs.length; ++i) {
					var a = attrs[i];
					$("#attr_" + a.get("attribute")).val(a.get("value"));
				}
				this.$(".charName").text(this.curChar.get("name"));
			} else {
				this.inputs.prop("disabled", true);
				this.$(".charName").text("---");
			}
		},

		saveChar: function() {
			var self = this;
			this.inputs.each(function() {
				var attrId = $(this).data("attributeid");
				//this feels inefficient...
				var attr = self.mainView.attributes.get(attrId);
				self.curChar.attr(attr.get("name"), $(this).val());
			});
			self.curChar.saveAttrs();
		}
	});

	var SelectCharView = Backbone.View.extend({
		el: ".selectChar",
		events: {
			"click .newChar": "newChar",
			"click .viewChar": "viewChar"
		},
		initialize: function() {
			this.mainView = null;
			this.editView = null;
		},

		newChar: function() {

		},
		viewChar: function(e) {
			if (!this.mainView || !this.editView) {
				console.log("views not linked!");
				return;
			}
			var character = this.mainView.createdChars.get($(e.currentTarget).data("characterid"));
			this.editView.curChar = character;
			this.editView.render();
		}
	});

	$(function() {
		var mainView = new CreateCharView();
		var selView = new SelectCharView();
		var editView = new EditViewChar();

		//link the views together
		selView.mainView = editView.mainView = mainView;
		selView.editView = editView;
	});
})();