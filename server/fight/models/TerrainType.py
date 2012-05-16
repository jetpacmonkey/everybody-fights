from django.db import models
from django.contrib import admin

class TerrainType(models.Model):
	name = models.CharField(max_length=32)

	def __unicode__(self):
		return self.name

	class Meta:
		app_label = 'fight'