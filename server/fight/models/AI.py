from django.db import models

class AIEngine(models.Model):
	TYPE_RAND = "random"
	TYPE_CHOICES = (
		(TYPE_RAND, "Random"),
	)

	aiType = models.CharField(max_length=16, default=TYPE_RAND, choices=TYPE_CHOICES, verbose_name="AI Engine Type")

	def __unicode__(self):
		if self.aiType == self.TYPE_RAND:
			return "Random"

	class Meta:
		app_label = "fight"
		verbose_name = "AI Engine"


