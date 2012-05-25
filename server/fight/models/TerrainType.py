from django.db import models
from django.contrib import admin

class TerrainType(models.Model):
	name = models.CharField(max_length=32)
	color = models.CharField(max_length=32,  # I can't imagine a color longer than 21 characters ( rgba(255,255,255,255) ), but better safe than sorry
								help_text="Visual representation of this terrain type",
								default="#FFFFFF")

	def __unicode__(self):
		return self.name

	class Meta:
		app_label = 'fight'