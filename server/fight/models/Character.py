from django.db import models
from django.core import validators

from fight.models.Attribute import Attribute
from django.contrib.auth.models import User

class Character(models.Model):
	name = models.CharField(max_length = 128)
	creator = models.ForeignKey(User, null=True)

	def __unicode__(self):
		return self.name

	def attr(self, name, value = None):
		attribute = self.characterattribute_set.filter(name=name)
		if not attribute.exists() and value is None: #getting an attribute that hasn't been applied to this character
			defAttr = Attribute.objects.filter(name=name)
			if not defAttr.exists():
				return None
			return defAttr[0].default
		elif not attribute.exists(): #adding the attribute
			charAttr = CharacterAttribute()
			charAttr.character = self
			attrObj = Attribute.objects.filter(name=name)
			if not attrObj.exists():
				return None
			charAttr.attribute = attrObj[0]
			charAttr.value = value
			charAttr.save()
		elif value is not None: #setting an existing attribute
			a = attribute[0]
			a.value = value
			a.save()
		else: #getting an existing attribute
			return attribute[0].value


	class Meta:
		app_label = 'fight'

class CharacterAttribute(models.Model):
	character = models.ForeignKey(Character)
	attribute = models.ForeignKey(Attribute)
	value = models.IntegerField()
