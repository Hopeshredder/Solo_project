from django.db import models
from django.contrib.auth import get_user_model
from datetime_app.models import Day, Week
from datetime import timedelta

User = get_user_model()

class FoodLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='foodlogs')
    food_name = models.CharField(max_length=100)
    calories = models.PositiveIntegerField()
    protein = models.PositiveIntegerField()
    carbs = models.PositiveIntegerField()
    fat = models.PositiveIntegerField()
    image_url = models.URLField(blank=True)
    time_logged = models.DateTimeField(auto_now_add=True)
    parent_day = models.ForeignKey(Day, on_delete=models.CASCADE, related_name='logs')

    def save(self, *args, **kwargs):
        if not self.pk:
            log_date = self.time_logged.date()
            week_start = log_date - timedelta(days=log_date.weekday())
            week, _ = Week.objects.get_or_create(start_date=week_start)
            day, _ = Day.objects.get_or_create(date=log_date, defaults={'parent_week': week})
            self.parent_day = day

        super().save(*args, **kwargs)

        self.parent_day.daily_calorie_total = self.parent_day.logs.aggregate(
            total=models.Sum('calories'))['total'] or 0
        self.parent_day.save()

        self.parent_day.parent_week.weekly_calorie_total = FoodLog.objects.filter(
            parent_day__parent_week=self.parent_day.parent_week
        ).aggregate(total=models.Sum('calories'))['total'] or 0
        self.parent_day.parent_week.save()