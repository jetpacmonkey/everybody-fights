from tastypie.resources import ModelResource
from fight.models import Character, CharacterAttribute, Attribute
from django.contrib.auth.models import User
from tastypie.authorization import Authorization
from tastypie import fields

class CharacterResource(ModelResource):

	class Meta:
		queryset = Character.objects.all()
		resource_name = 'character'
		authorization = Authorization()
		always_return_data = True
		include_resource_uri = False

	def dehydrate(self, bundle):
		bundle.data['creator'] = bundle.obj.creator.id
		return bundle

	def hydrate(self, bundle):
		if not bundle.obj.id:
			bundle.obj.creator = bundle.request.user
		else:
			# maybe shouldn't allow this?
			bundle.obj.creator = User.objects.get(id=bundle.data['creator'])
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