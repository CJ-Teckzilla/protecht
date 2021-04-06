from django.urls import path
from . import views
urlpatterns = [
    path("", views.index, name="detail"),
    path("success/<str:order_num>", views.display, name="display"),
]