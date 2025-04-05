from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # Personal Details
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    dob = models.DateField()
    adhaar = models.CharField(max_length=12, unique=True)
    adhaarFile = models.CharField(
        max_length=500, null=True, blank=True
    )  # Store file link
    adhaarVerified = models.BooleanField(default=False)

    # Educational Details
    class10School = models.CharField(max_length=255)
    class10Percentage = models.DecimalField(max_digits=5, decimal_places=2)
    class10Marksheet = models.CharField(
        max_length=500, null=True, blank=True
    )  # Store file link
    class10Verified = models.BooleanField(default=False)

    class12College = models.CharField(max_length=255)
    class12Percentage = models.DecimalField(max_digits=5, decimal_places=2)
    class12Marksheet = models.CharField(
        max_length=500, null=True, blank=True
    )  # Store file link
    class12Verified = models.BooleanField(default=False)

    bachelorsUniversity = models.CharField(max_length=255)
    bachelorsPercentage = models.DecimalField(max_digits=5, decimal_places=2)
    bachelorsMarksheet = models.CharField(
        max_length=500, null=True, blank=True
    )  # Store file link
    bachelorsVerified = models.BooleanField(default=False)

    #pancard
    pannumber = models.CharField(max_length=10, unique=True)
    pannumberVerified = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.name} ({self.user.username})"
