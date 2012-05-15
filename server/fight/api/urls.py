from django.conf.urls import patterns, include, url

from fight.api import *
from tastypie.api import Api

v1_api = Api(api_name='v1')
v1_api.register(MapResource())
v1_api.register(UserResource())

urlpatterns = patterns('',
		('', include(v1_api.urls))
	)