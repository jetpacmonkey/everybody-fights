from django import template
from fight.utils import Utils
import re

register = template.Library()

@register.filter(name='json')
def toJSON(querySet):
	return Utils.toJSON(querySet)


@register.filter(name='wordify')
def wordify(s):
	s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', s)
	final = re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1)
	final = final[0].upper() + final[1:]
	return final