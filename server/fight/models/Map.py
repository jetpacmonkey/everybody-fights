from django.db import models
from django.contrib import admin

class Map(models.Model):
	name = models.CharField(max_length=128)

	def __unicode__(self):
		return self.name

	class Meta:
		app_label = 'fight'

class MapAdmin(admin.ModelAdmin):
	fields = ['name']