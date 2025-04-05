from django.urls import path
from .views import upload_image, verify_aadhar, verify_marksheet,extract_data, verify_pan

urlpatterns = [
    path("upload-image/", upload_image, name="upload image"),
    path("aadhaar/", verify_aadhar, name="verify aadhar"),
    path("extract_data/", extract_data, name="extract data"),
    path("marksheet/", verify_marksheet, name="verify marksheet"),
    path("pan/", verify_pan, name="verify pan"),
]
