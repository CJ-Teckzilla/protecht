from django.urls import path
from . import views
urlpatterns = [
    path("", views.test, name="test"),
    path("success/<str:order_num>", views.display, name="display"),
]