from tastypie.resources import ModelResource
from tastypie import fields
from fight.models import Game, GameCell, GamePlayer, GameCharacter, GameCell, Map, Character
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


class GameCharacterResource(ModelResource):
	class Meta:
		queryset = GameCharacter.objects.all()
		resource_name = 'gameCharacter'
		authorization = Authorization()  # TODO: real authorization
		always_return_data = True
		include_resource_uri = False

	def dehydrate(self, bundle):
		bundle.data['character'] = bundle.obj.character_id
		bundle.data['cell'] = bundle.obj.cell_id
		bundle.data['owner'] = bundle.obj.owner_id

		return bundle

	def hydrate(self, bundle):
		bundle.obj.character = Character.objects.get(id=bundle.data['character'])
		if "cell" in bundle.data:
			del bundle.data['cell']  # don't allow cell to be arbitrarily set through the API

		if not bundle.obj.id and "owner" in bundle.data:
			owner = GamePlayer.objects.get(id=bundle.data['owner'])
			if owner.player == bundle.request.user:
				bundle.obj.owner = owner
				owner.apRemaining -= bundle.obj.character.attr("cost")
				owner.save()
			else:
				raise BaseException("Invalid value for 'owner' set by '%s'" % bundle.request.user)
		elif "owner" in bundle.data:
			del bundle.data['owner']  # don't allow the owner to be changed

		return bundle

class GamePlayerResource(ModelResource):
	class Meta:
		queryset = GamePlayer.objects.all()
		resource_name = 'gamePlayer'
		authorization = Authorization()  # TODO: real authorization
		always_return_data = True
		include_resource_uri = False

	def hydrate(self, bundle):
		if "game" in bundle.data:
			del bundle.data["game"]
		if "player" in bundle.data:
			del bundle.data["player"]
		if ("status" in bundle.data and bundle.data["status"] != bundle.obj.status and
					bundle.data["status"] == "ok" and bundle.obj.game.gamePhase == 1 and
					bundle.obj.game.gameplayer_set.exclude(status="ok").count() <= 1):
			bundle.obj.game.gamePhase += 1
			bundle.obj.game.save()

		return bundle

