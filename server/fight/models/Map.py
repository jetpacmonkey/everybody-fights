from django.db import models
from django.contrib import admin
from django.contrib.auth.models import User

class Map(models.Model):
	name = models.CharField(max_length=128)
	creator = models.ForeignKey(User, null=True)

	def __unicode__(self):
		return "%s (by %s)" % (self.name, self.creator)

	def dimensions(self):
		try:
			lastCell = self.cell_set.all().order_by("-x", "-y")[0]
		except:
			return (None, None)
		return (lastCell.x + 1, lastCell.y + 1)

	class Meta:
		app_label = 'fight'
		ordering = ("creator", "name")

class MapAdmin(admin.ModelAdmin):
	fields = ['name', 'creator']