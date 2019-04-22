from django.db import models


class Player(models.Model):
    username = models.CharField(max_length=15)
    email = models.EmailField()
    score = models.IntegerField(default=0)
    cheat_times = models.IntegerField(default=0)

    def __str__(self):
        return self.username
