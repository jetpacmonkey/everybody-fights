(function() {
	Character = Backbone.Model.extend({
		defaults: {
			name: "",
			creator: null
		},
		attr: function(name, value) {
			var attribute = this.collection.getCollection("characterAttributes").getByNameAndChar(name, this);
			var getter = (arguments.length == 1);
			if (!attribute && getter) {
				var defAttr = this.collection.getCollection("attributes").getByName(name);
				if (defAttr) {
					return defAttr.get('default');
				}
				return null;
			} else if (!attribute) { //adding the attribute
				if (value === "") {
					return; //trying to remove the attribute, but it's already not there
				}
				var attrObj = this.collection.getCollection("attributes").getByName(name);
				if (!attrObj) {
					return null;
				}
				var charAttr = {};
				charAttr.attribute = attrObj.get('id');
				charAttr.character = this.get('id');
				charAttr.value = value;
				this.collection.getCollection("characterAttributes").add([charAttr]);
			} else if (getter) {
				return attribute.get('value');
			} else {
				if (value === "") {
					attribute.destroy({wait: true});
					attribute.collection.remove(attribute);
				} else {
					attribute.set('value', value);
				}
			}
		},
		saveAttrs: function() {
			var attrs = this.collection.getCollection("characterAttributes").where({character: this.get("id")});
			var arr = [];
			for (var i=0; i<attrs.length; ++i) {
				arr.push(attrs[i].toJSON());
			}
			$.ajax({
				type: "PUT",
				dataType: 'json',
				data: JSON.stringify({"objects": arr}),
				url: this.collection.getCollection("characterAttributes").url(),
				contentType: "application/json",
				async: false
			});
		}
	});

	CharacterSet = BaseCollection.extend({
		model: Character,
		url: function() {
			return this.baseUrl + "character/";
		},
		initialize: function() {
			this.globalCollections.characters = this;

			BaseCollection.prototype.initialize.call(this);
		}
	});

	CharacterAttribute = Backbone.Model.extend({
		defaults: {
			character: null,
			attribute: null,
			value: 0
		}
	});

	CharacterAttributeSet = BaseCollection.extend({
		model: CharacterAttribute,
		url: function() {
			return this.baseUrl + "characterAttribute/";
		},
		initialize: function() {
			this.globalCollections.characterAttributes = this;
			this.on("add", this.onCreate);

			BaseCollection.prototype.initialize.call(this);
		},
		getByNameAndChar: function(name, character) {
			var attr = this.getCollection("attributes").getByName(name);
			var arr = this.where({
				attribute: attr.get('id'),
				character: character.get('id')
			});
			if (arr.length) {
				return arr[0];
			} else {
				return null;
			}
		},
		onCreate: function(cAtt, coll, options) {
			cAtt.save(["character", "value", "attribute"], {wait: true});
		}
	});
})();