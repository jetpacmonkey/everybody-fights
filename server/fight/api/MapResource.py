from tastypie.resources import ModelResource
from tastypie import fields
from fight.models import Map, Cell, TerrainType
from tastypie.authorization import Authorization

class MapResource(ModelResource):

	class Meta:
		queryset = Map.objects.all()
		resource_name = 'map'
		authorization = Authorization()  # TODO: real authorization
		always_return_data = True
		include_resource_uri = False

	def dehydrate(self, bundle):
		bundle.data['creator'] = bundle.obj.creator.id
		bundle.data['id'] = int(bundle.data['id'])
		return bundle

	def hydrate(self, bundle):
		if not bundle.obj.id:
			bundle.obj.creator = bundle.request.user

		if 'creator' in bundle.data:
			del bundle.data['creator'] #don't allow creator to be modified
		return bundle


class CellResource(ModelResource):

	class Meta:
		queryset = Cell.objects.all()
		resource_name = 'cell'
		authorization = Authorization()  # TODO: real authorization
		always_return_data = True
		include_resource_uri = False

	def dehydrate(self, bundle):
		bundle.data['terrain'] = bundle.obj.terrain.id
		bundle.data['mapObj'] = bundle.obj.mapObj.id
		return bundle

	def hydrate(self, bundle):
		if 'terrain' in bundle.data:
			bundle.obj.terrain = TerrainType.objects.get(id=bundle.data['terrain'])
		if 'mapObj' in bundle.data:
			bundle.obj.mapObj = Map.objects.get(id=bundle.data['mapObj'])
		return bundle