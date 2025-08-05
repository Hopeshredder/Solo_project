from django.db import models

class Week(models.Model):
    # Each week has a unique starting date (no two weeks start on the same Monday)
    start_date = models.DateField(unique=True)
    weekly_calorie_total = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Week of {self.start_date}"

class Day(models.Model):
    date = models.DateField(unique=True)
    parent_week = models.ForeignKey(Week, on_delete=models.CASCADE, related_name='days')
    daily_calorie_total = models.PositiveIntegerField(default=0)

    def __str__(self):
        return str(self.date)