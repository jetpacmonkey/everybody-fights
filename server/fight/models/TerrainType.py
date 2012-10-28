from django.db import models
from django.contrib import admin
from fight.models.Attribute import Attribute

class TerrainType(models.Model):
	name = models.CharField(max_length=32)
	color = models.CharField(max_length=32,  # I can't imagine a color longer than 21 characters ( rgba(255,255,255,255) ), but better safe than sorry
								help_text="Visual representation of this terrain type",
								default="#FFFFFF")

	def __unicode__(self):
		return self.name

	class Meta:
		app_label = 'fight'


modifierOperators = (
	("+", "+"),
	("-", "-"),
	("/", "/"),
	("*", "X")
)


class TerrainModifier(models.Model):
	terrain = models.ForeignKey(TerrainType)
	attribute = models.ForeignKey(Attribute)
	operator = models.CharField(max_length=1, choices=modifierOperators)
	effect = models.FloatField(default=0)

	def applyTo(self, val):
		if self.operator == "+":
			return val + self.effect
		elif self.operator == "-":
			return val - self.effect
		elif self.operator == "/":
			return round(val / self.effect)
		elif self.operator == "*":
			return round(val * self.effect)
		else:
			return val

	def __unicode__(self):
		return "%s: %s %s %g" % (self.terrain, self.attribute.name, self.get_operator_display(), self.effect)

	class Meta:
		app_label = 'fight'


requirementOperators = (
	("<", "<"),
	("<=", "<="),
	("==", "="),
	(">", ">"),
	(">=", ">=")
)


class TerrainRequirement(models.Model):
	terrain = models.ForeignKey(TerrainType)
	attribute = models.ForeignKey(Attribute)
	operator = models.CharField(max_length=2, choices=requirementOperators)
	value = models.IntegerField()

	def __unicode__(self):
		return "%s: %s %s %i" % (self.terrain, self.attribute, self.get_operator_display(), self.value)

	class Meta:
		app_label = 'fight'

