from tastypie.resources import ModelResource
from tastypie import fields
from fight.models import Game, GameCell, GamePlayer, Map
from tastypie.authorization import Authorization

class GameResource(ModelResource):
	class Meta:
		queryset = Game.objects.all()
		resource_name = 'game'
		authorization = Authorization()  # TODO: real authorization
		always_return_data = True
		include_resource_uri = False

	def dehydrate(self, bundle):
		bundle.data['creator'] = bundle.obj.creator.id
		bundle.data['currentPlayer'] = bundle.obj.currentPlayer.id
		bundle.data['mapObj'] = bundle.obj.mapObj.id

		return bundle

	def hydrate(self, bundle):
		print bundle
		if not bundle.obj.id:
			bundle.obj.creator = bundle.request.user
			bundle.obj.currentPlayer = bundle.request.user
			bundle.obj.mapObj = Map.objects.get(id=bundle.data['mapObj'])
			bundle.obj.save()
			# create initial GamePlayer
			initGamePlayer = GamePlayer()
			initGamePlayer.game = bundle.obj
			initGamePlayer.player = bundle.request.user
			initGamePlayer.save()
			# create GameCells
			cells = bundle.obj.mapObj.cell_set.all()
			for cell in cells:
				newCell = GameCell()
				newCell.origCell = cell
				newCell.game = bundle.obj
				newCell.save()

		if 'creator' in bundle.data:
			del bundle.data['creator']

		return bundle
