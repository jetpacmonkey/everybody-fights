from tastypie.resources import ModelResource
from tastypie import fields
from fight.models import Map
from fight.api.UserResource import UserResource

class MapResource(ModelResource):
	creator = fields.ForeignKey(UserResource, 'creator')

	class Meta:
		queryset = Map.objects.all()
		resource_name = 'map'