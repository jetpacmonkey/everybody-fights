from django.db import models

class Attribute(models.Model):
	name = models.CharField(max_length = 32, unique = True)
	default = models.IntegerField(default = None, null = True,
				help_text = "Value returned when character doesn't have this attribute")

	def __unicode__(self):
		return self.name

	class Meta:
		app_label = 'fight'

class Modifier(models.Model):
	permanent = models.BooleanField(default = False)
	attribute = models.ForeignKey(Attribute)
	effect = models.IntegerField(default = 0)

	def __unicode__(self):
		return "%s %+i%s" % (self.attribute.name, self.effect, (" (permanent)" if self.permanent else ""))

	class Meta:
		app_label = 'fight'