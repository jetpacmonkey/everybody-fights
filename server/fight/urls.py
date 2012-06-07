from django.conf.urls import patterns, include, url

urlpatterns = patterns('fight.views',
	url(r'^$', 'index'),
	url(r'^index/', 'index'),
	url(r'^createChar/', 'createChar'),
	url(r'^createMap/', 'createMap'),
	url(r'^createGame/', 'createGame'),
	url(r'^currentGames/', 'currentGames'),

	url(r'^api/', include('fight.api.urls'))
)
