from django.urls import path
from . import views

urlpatterns = [
    path('api/player/', views.PlayerListCreate.as_view()),
]
