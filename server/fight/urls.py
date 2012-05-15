from django.conf.urls import patterns, include, url

urlpatterns = patterns('fight.views',
	url(r'^$', 'index'),
	url(r'^index/', 'index'),


	url(r'^api/', include('fight.api.urls'))
	)