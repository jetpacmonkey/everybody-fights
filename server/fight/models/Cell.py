from django.db import models
from django.contrib import admin
from fight.models.TerrainType import TerrainType
from fight.models import Map

class Cell(models.Model):
	terrain = models.ForeignKey(TerrainType, null=True)
	mapObj = models.ForeignKey(Map, verbose_name="Map")
	x = models.IntegerField()
	y = models.IntegerField()

	def __unicode__(self):
		return "%s (%s) - %s" % (self.coordsString(), self.terrain, self.mapObj)

	def coordsString(self):
		return "(%d, %d)" % (self.x, self.y)
	coordsString.short_description = "Coordinates"
	coordsString.admin_order_field = 'x'

	def isAdj(self, other):
		xDiff = abs(self.x - other.x)
		yDiff = self.y - other.y
		if xDiff > 1:
			return False
		if xDiff == 0:
			return abs(yDiff) == 1
		if self.x % 2 == 0:  # even column, adjacent to self.y - 1 and self.y
			return yDiff == 0 or yDiff == 1
		return yDiff == 0 or yDiff == -1

	class Meta:
		app_label = 'fight'
		unique_together = ("mapObj", "x", "y")
		ordering = ("mapObj", "x", "y")

class CellAdmin(admin.ModelAdmin):
	list_display = ("mapObj", "coordsString", "terrain")
	ordering = ("mapObj", "x", "y")