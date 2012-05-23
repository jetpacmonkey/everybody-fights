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
			return this;
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

	var SelectOneView = Backbone.View.extend({
		tagName: "div",
		className: "viewChar",
		render: function() {
			var charName = $("<div>").addClass("charName").text(this.model.get("name"));
			this.$el.html(charName).append("<div class='charBack'></div>");
			this.$el.data("characterid", this.model.get("id"));
			return this;
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
		render: function() {
			var self = this;
			this.$(".viewChar").remove();
			this.mainView.createdChars.forEach(function(character, idx, coll) {
				var subview = new SelectOneView({model: character});
				self.$el.append(subview.render().$el);
			});
			return this;
		},

		newChar: function() {
			var newName = prompt('Character Name');
			if (!newName) {
				return;
			}
			var self = this;
			this.editView.curChar = new Character({name: newName});
			this.mainView.createdChars.add(this.editView.curChar);
			this.editView.curChar.save(["name"], {
				success: function() {
					self.editView.render();
					self.render();
				}
			});
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