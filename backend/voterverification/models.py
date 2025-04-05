from django.db import models

# Create your models here.

class VoterDetail(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    
    VOTING_STATUS_CHOICES = (
        ('voted', 'Voted'),
        ('pending', 'Pending'),
    )
    
    name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    voter_id = models.CharField(max_length=50, unique=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    dob = models.DateField()
    voting_status = models.CharField(
        max_length=10, 
        choices=VOTING_STATUS_CHOICES, 
        default='pending'
    )
    
    def __str__(self):
        return f"{self.name} ({self.voter_id})"
