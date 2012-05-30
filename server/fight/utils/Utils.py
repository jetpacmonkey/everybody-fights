from django.utils import simplejson
from django.core import serializers
from time import mktime

class BetterEncoder(simplejson.JSONEncoder):
	def default(self, obj):
		if obj.__class__.__name__ == "QuerySet" or obj.__class__.__name__ == "EmptyQuerySet":
			return serializers.serialize('python', obj)
		elif hasattr(obj, "timetuple"):
			return mktime(obj.timetuple())
		return simplejson.JSONEncoder.default(self, obj)

def toJSON(obj):
	return simplejson.dumps(obj, cls=BetterEncoder)