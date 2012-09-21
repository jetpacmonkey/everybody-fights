from django.utils import simplejson
from django.core import serializers
from time import mktime
from django.db.models import Model

class BetterEncoder(simplejson.JSONEncoder):
	def default(self, obj):
		if obj.__class__.__name__ == "QuerySet" or obj.__class__.__name__ == "EmptyQuerySet":
			return serializers.serialize('python', obj)
		elif isinstance(obj, Model):
			return serializers.serialize('python', [obj])[0]
		elif hasattr(obj, "timetuple"):
			return mktime(obj.timetuple())
		elif hasattr(obj, "__float__"):
			return float(obj)
		return simplejson.JSONEncoder.default(self, obj)

def toJSON(obj):
	return simplejson.dumps(obj, cls=BetterEncoder)