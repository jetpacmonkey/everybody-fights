(function() {
	var CreateMapView = BaseView.extend({
		initialize: function() {
			this.createdMaps = new MapSet();
			this.cells = new CellSet();
			this.terrainTypes = new TerrainTypeSet();

			this.load("createdMaps", "cells", "terrainTypes");

			this.editView = new EditMapView();
			this.selView = new SelectMapView();
			this.editView.mainView = this.selView.mainView = this;

			BaseView.prototype.initialize.apply(this);
		}
	});

	var SelectMapView = Backbone.View.extend({
		el: ".selectMap",
		events: {
			"click .newMap": "newMap",
			"click .viewMap": "viewMap"
		},
		render: function() {

		},

		newMap: function(e) {

		},
		viewMap: function(e) {
			var mapid = $(e.currentTarget).data("mapid");
			var map = this.mainView.createdMaps.get(mapid);
			this.mainView.editView.model = map;
			this.mainView.editView.render();
		}
	});

	var TerrainSelectView = Backbone.View.extend({
		el: ".mapTerrainTypes",
		initialize: function() {
			this.selected = null;
		},

		render: function() {
			if (this.selected) {
				this.$(".selectedTerrainTypeName").text(this.selected.get("name")).show();
				this.$(".selectedTerrainType").attr("class", "selectedTerrainType").addClass("terrain-" + this.selected.get("id"));
			} else {
				this.$(".selectedTerrainTypeName").hide();
				this.$(".selectedTerrainType").attr("class", "selectedTerrainType")
			}
			return this;
		}
	});

	var EditMapView = Backbone.View.extend({
		el: ".editMap",
		events: {
			"click .renameMap": "rename",
			"click .resizeMap": "resize",
			"click .terrainSelect": "terrainSelect",
			"click .mapCell": "terrainSet",
			"click .fillTerrain": "terrainFill",
			"change #mapWidth, #mapHeight": "changeDimInput",
			"click .saveMap": "saveMap"
		},
		initialize: function() {
			this.terrainView = new TerrainSelectView();
		},

		render: function() {
			this.$(".mapCells").empty();
			if (this.model) {
				//properties
				this.$(".mapName").text(this.model.get("name"));
				var dim = this.model.getDimensions();
				this.$("#mapWidth").val(dim.x).prop("disabled", false);
				this.$("#mapHeight").val(dim.y).prop("disabled", false);
				$(".renameMap").show();

				//cells
				var mapDiv = this.model.render(this.mainView.cells);
				this.$(".mapCells").html(mapDiv);
			} else {
				this.$(".mapName").text("---");
			}

			return this;
		},
		rename: function() {

		},
		changeDimInput: function(e) {
			$(e.currentTarget).val(Math.floor($(e.currentTarget).val()));

			var oldDim = this.model.getDimensions();
			var changed = this.$("#mapWidth").val() != oldDim.x || this.$("#mapHeight").val() != oldDim.y;
			if (changed) {
				this.$(".resizeMap").show();
			} else {
				this.$(".resizeMap").hide();
			}
		},
		resize: function() {
			var self = this;
			this.model.resize({
				"x": this.$("#mapWidth").val(),
				"y": this.$("#mapHeight").val(),
				"cells": this.mainView.cells,
				success: function() {
					self.render();
				}
			});
		},
		terrainSelect: function(e) {
			var terrainId = $(e.currentTarget).data("terrainid");
			var terrain = this.mainView.terrainTypes.get(terrainId);
			this.terrainView.selected = terrain;
			this.terrainView.render();
		},
		terrainSet: function(e) {
			var cellId = $(e.currentTarget).data("cellid");
			var cell = this.mainView.cells.get(cellId);
			cell.set("terrain", this.terrainView.selected.get("id"));
			this.render();
		},
		terrainFill: function() {
			this.model.fillTerrain(this.terrainView.selected, this.mainView.cells);
			this.render();
		},
		saveMap: function() {
			var self = this;
			this.model.saveCells({
				success: function() {
					self.render();
				}
			}, this.mainView.cells)
		}
	});

	$(function() {
		new CreateMapView();
	});
})();