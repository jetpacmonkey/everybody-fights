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
				attribute.set('value', value);
			}
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
			cAtt.save();
		}
	});
})();