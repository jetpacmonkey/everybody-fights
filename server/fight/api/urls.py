from django.conf.urls import patterns, include, url

from fight.api import *

map_resource = MapResource()

urlpatterns = patterns('',
		('', include(map_resource.urls))
	)