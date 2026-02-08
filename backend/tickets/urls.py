from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TicketViewSet
from .me import me


router = DefaultRouter()
router.register(r"tickets", TicketViewSet, basename="tickets")

urlpatterns = [
    path("me/", me,),
    path("", include(router.urls)),
]
