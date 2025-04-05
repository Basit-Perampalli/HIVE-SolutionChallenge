from django.contrib import admin
from .models import VoterDetail

@admin.register(VoterDetail)
class VoterDetailAdmin(admin.ModelAdmin):
    list_display = ('name', 'voter_id', 'father_name', 'gender', 'dob', 'voting_status')
    search_fields = ('name', 'voter_id', 'father_name')
    list_filter = ('gender', 'voting_status')
