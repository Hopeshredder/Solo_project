import re
from django.core.exceptions import ValidationError

# Checks to make sure the given name (first and last) contain only alphabetical characters and some key exceptions
def validate_name_format(value):
    pattern = r"^[A-Za-z]+([-' ][A-Za-z]+)*$"
    if not re.match(pattern, value):
        raise ValidationError(
            "Name must contain only alphabetic characters and may include hyphens, apostrophes, or spaces."
        )