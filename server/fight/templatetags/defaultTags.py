from django import template
from fight.utils import Utils

register = template.Library()

@register.filter(name='json')
def toJSON(querySet):
	return Utils.toJSON(querySet)