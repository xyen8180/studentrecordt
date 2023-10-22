"""
URL configuration for studentrecords project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from studentrecords import settings
from .views import (
    delete_student_info,
    get_students,
    add_students,
    overview,
    students,
    all_students,
    update_student,
    delete_student,
    update_student_info,
)
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView

# from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("get_students/", get_students, name="get_students"),
    path("update_students/<int:id>/", update_student, name="update-student"),
    path("delete_students/<int:id>/", delete_student, name="delete-student"),
    path("add_student/", add_students, name="add_students"),
    path("", overview, name="overview"),
    path("students/", students, name="students"),
    path("student_list/", all_students, name="all_students"),
    path("student_list/<int:id>", all_students, name="all_students"),
    path(
        "update_student_info/<int:id>", update_student_info, name="update_student_info"
    ),
    path(
        "delete_student_info/<int:id>", delete_student_info, name="delete_student_info"
    ),
    path("auth/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
