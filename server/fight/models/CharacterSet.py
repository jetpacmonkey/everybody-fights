from django.db import models
from fight.models.Character import Character
from django.contrib.auth.models import User

class CharacterSet(models.Model):
	name = models.CharField(max_length = 128, default = "New Set")
	creator = models.ForeignKey(User)
	chars = models.ManyToManyField(Character)

	class Meta:
		app_label = "fight"