from django.contrib import admin
from .models import Player


class PlayerAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'score', 'cheat_times')


admin.site.register(Player, PlayerAdmin)
