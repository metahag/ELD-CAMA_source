"""
URL configuration for cama_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import handler400, handler403, handler404, handler500
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenRefreshView

def health_check(request):
    return HttpResponse("OK", status=200)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("myapi.urls")),
    path('api/health/', health_check, name='health_check'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
handler400 = 'django.views.defaults.bad_request'
handler403 = 'django.views.defaults.permission_denied'
handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'
