from django.db import models
from django.contrib import admin
from fight.models.TerrainType import TerrainType
from fight.models import Map

class Cell(models.Model):
	terrain = models.ForeignKey(TerrainType)
	mapObj = models.ForeignKey(Map, verbose_name="Map")
	x = models.IntegerField()
	y = models.IntegerField()

	def __unicode__(self):
		return "%s (%s) - %s" % (self.coordsString(), self.terrain, self.mapObj)

	def coordsString(self):
		return "(%d, %d)" % (self.x, self.y)
	coordsString.short_description = "Coordinates"
	coordsString.admin_order_field = 'x'

	class Meta:
		app_label = 'fight'
		unique_together = ("mapObj", "x", "y")
		ordering = ("mapObj", "x", "y")

class CellAdmin(admin.ModelAdmin):
	list_display = ("mapObj", "coordsString", "terrain")
	ordering = ("mapObj", "x", "y")