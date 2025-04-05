from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'adhaar', 'adhaarVerified', 'pannumber', 'pannumberVerified')
    search_fields = ('name', 'email', 'phone', 'adhaar', 'pannumber')
    list_filter = ('adhaarVerified', 'class10Verified', 'class12Verified', 'bachelorsVerified', 'pannumberVerified')
    fieldsets = (
        ('Personal Details', {
            'fields': ('user', 'name', 'email', 'phone', 'address', 'dob', 'adhaar', 'adhaarFile', 'adhaarVerified')
        }),
        ('Education - Class 10', {
            'fields': ('class10School', 'class10Percentage', 'class10Marksheet', 'class10Verified')
        }),
        ('Education - Class 12', {
            'fields': ('class12College', 'class12Percentage', 'class12Marksheet', 'class12Verified')
        }),
        ('Education - Bachelors', {
            'fields': ('bachelorsUniversity', 'bachelorsPercentage', 'bachelorsMarksheet', 'bachelorsVerified')
        }),
        ('PAN Card', {
            'fields': ('pannumber', 'pannumberVerified')
        }),
    )
