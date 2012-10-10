from django.conf.urls import patterns, include, url

from fight.api import *
from tastypie.api import Api

v1_api = Api(api_name='v1')
v1_api.register(MapResource())
v1_api.register(CellResource())
v1_api.register(UserResource())
v1_api.register(CharacterResource())
v1_api.register(CharacterAttributeResource())
v1_api.register(GameResource())
v1_api.register(GameCharacterResource())
v1_api.register(GamePlayerResource())

urlpatterns = patterns('',
		('', include(v1_api.urls)),
		(r'^resize/(?P<mapId>[0-9]+)/(?P<x>[0-9]*):(?P<y>[0-9]+)/?$', resize),  # resize/mapid/x:y with an optional trailing slash
		(r'^move/(?P<charId>[0-9]+)/(?P<pathHash>(?:[0-9]+:?)+)/?$', followPath),  # move/charId/cellId1:cellId2:cellId3:...
		(r'^endTurn/(?P<gameId>[0-9]+)/?$', endTurn),
		(r'^attack/(?P<charId1>[0-9]+):(?P<charId2>[0-9]+)/?$', attack)
	)