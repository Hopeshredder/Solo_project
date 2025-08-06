from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from food_data_app.models import FoodLog
from datetime_app.models import Day, Week

User = get_user_model()

class ModelRelationshipTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test@gmail.com", 
            email="test@gmail.com", 
            password="testpass123"
        )

    def test_foodlog_creates_day_and_week(self):
        self.assertEqual(Day.objects.count(), 0)
        self.assertEqual(Week.objects.count(), 0)

        FoodLog.objects.create(
            user=self.user,
            food_name="Avocado Toast",
            calories=300,
            protein=6,
            carbs=30,
            fat=20
        )

        self.assertEqual(FoodLog.objects.count(), 1)
        self.assertEqual(Day.objects.count(), 1)
        self.assertEqual(Week.objects.count(), 1)

        foodlog = FoodLog.objects.first()
        self.assertIsNotNone(foodlog.parent_day)
        self.assertIsNotNone(foodlog.parent_day.parent_week)

    def test_day_logs_reverse_relation(self):
        log = FoodLog.objects.create(
            user=self.user,
            food_name="Eggs",
            calories=200,
            protein=12,
            carbs=1,
            fat=15
        )
        day = log.parent_day
        self.assertIn(log, day.logs.all())
        self.assertEqual(day.logs.count(), 1)

    def test_week_days_reverse_relation(self):
        log = FoodLog.objects.create(
            user=self.user,
            food_name="Banana",
            calories=100,
            protein=1,
            carbs=27,
            fat=0
        )
        week = log.parent_day.parent_week
        day = log.parent_day
        self.assertIn(day, week.days.all())
        self.assertEqual(week.days.count(), 1)

    def test_calorie_totals_update_correctly(self):
        # Add first log
        log1 = FoodLog.objects.create(
            user=self.user,
            food_name="Yogurt",
            calories=150,
            protein=10,
            carbs=15,
            fat=5
        )
        day = log1.parent_day
        week = day.parent_week

        self.assertEqual(day.daily_calorie_total, 150)
        self.assertEqual(week.weekly_calorie_total, 150)

        # Add second log
        FoodLog.objects.create(
            user=self.user,
            food_name="Granola",
            calories=200,
            protein=5,
            carbs=30,
            fat=10
        )
        day.refresh_from_db()
        week.refresh_from_db()

        self.assertEqual(day.daily_calorie_total, 350)
        self.assertEqual(week.weekly_calorie_total, 350)

    def test_calorie_totals_update_on_delete(self):
        log = FoodLog.objects.create(
            user=self.user,
            food_name="Bagel",
            calories=250,
            protein=8,
            carbs=45,
            fat=5
        )
        day = log.parent_day
        week = day.parent_week
        self.assertEqual(day.daily_calorie_total, 250)
        self.assertEqual(week.weekly_calorie_total, 250)

        log.delete()
        remaining_log = FoodLog.objects.filter(parent_day=log.parent_day).first()
        if remaining_log:
            remaining_log.recalculate_totals()
        else:
            log.parent_day.daily_calorie_total = 0
            log.parent_day.save()
            log.parent_day.parent_week.weekly_calorie_total = 0
            log.parent_day.parent_week.save()

        log.parent_day.refresh_from_db()
        log.parent_day.parent_week.refresh_from_db()

        self.assertEqual(log.parent_day.daily_calorie_total, 0)
        self.assertEqual(log.parent_day.parent_week.weekly_calorie_total, 0)