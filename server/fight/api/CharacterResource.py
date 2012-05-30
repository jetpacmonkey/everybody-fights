from tastypie.resources import ModelResource
from fight.models import Character, CharacterAttribute, Attribute
from tastypie.authorization import Authorization
from tastypie import fields

class CharacterResource(ModelResource):

	class Meta:
		queryset = Character.objects.all()
		resource_name = 'character'
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
		else:
			del bundle.data['creator'] #don't allow creator to be modified
		return bundle

class CharacterAttributeResource(ModelResource):
	class Meta:
		queryset = CharacterAttribute.objects.all()
		resource_name = 'characterAttribute'
		authorization = Authorization()
		always_return_data = True
		include_resource_uri = False

	def dehydrate(self, bundle):
		bundle.data['character'] = bundle.obj.character.id
		bundle.data['attribute'] = bundle.obj.attribute.id
		return bundle

	def hydrate(self, bundle):
		bundle.obj.character = Character.objects.get(id=bundle.data['character'])
		bundle.obj.attribute = Attribute.objects.get(id=bundle.data['attribute'])
		return bundle