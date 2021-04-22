from django.urls import path
from . import views
import requests
urlpatterns = [
    path("", views.home, name="test"),
    path("success/<str:order_num>", views.display, name="display"),
    path("success/", views.success_response),
    path("get-token", views.get_token)
]
