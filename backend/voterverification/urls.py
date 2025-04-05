from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.get_all_voters, name='get_all_voters'),
    path('create/', views.create_voter_details, name='create_voter_details'),
    path('<int:pk>/update-status/', views.update_voting_status, name='update_voting_status'),
    path('<int:pk>/delete/', views.delete_voter, name='delete_voter'),
    path('verify/', views.upload_verify_voter_id, name='verify_voter_id'),
] 