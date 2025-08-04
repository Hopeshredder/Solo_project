from django.db import models
from django.contrib.auth.models import AbstractUser
from  .validators import validate_name_format
import django.core.validators as v

# Client/User model has the following fields:
    # email = username
    # first_name
    # last_name
    # password
class Client(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(validators=[validate_name_format, v.MaxLengthValidator(20), v.MinLengthValidator(2)])
    last_name = models.CharField(validators=[validate_name_format, v.MaxLengthValidator(30), v.MinLengthValidator(2)])
    

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []