from django.conf.urls import patterns, include, url

urlpatterns = patterns('fight.views',
	url(r'^$', 'index'),
	url(r'^index/', 'index'),
	url(r'^createChar/', 'createChar'),
	url(r'^createMap/', 'createMap'),
	url(r'^createGame/', 'createGame'),
	url(r'^currentGames/', 'currentGames'),
	url(r'^playGame/(?P<gameId>\d+)/?$', 'playGame'),
	url(r'^buyChars/(?P<gameId>\d+)/?$', 'buyChars'),

	url(r'^api/', include('fight.api.urls'))
) + patterns('fight.commands',
	url(r'^startGame/(?P<gameId>\d+)/?$', 'startGame')
)
