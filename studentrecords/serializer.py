from rest_framework import serializers
from .models import Students, Report, Subjects


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Students
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subjects
        fields = "__all__"


class MarkSheetSerializer(serializers.ModelSerializer):
    student = StudentSerializer(source="roll_number", read_only=True)
    subject = SubjectSerializer(source="subject_id", read_only=True)

    class Meta:
        model = Report
        fields = "__all__"


class CustomMarkSheetSerializer(MarkSheetSerializer):
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        custom_representation = {
            "student": {
                "id": representation["student"]["id"],
                "name": representation["student"]["name"],
                "roll_number": representation["student"]["roll_number"],
                "photo": representation["student"]["photo"],
                "class": representation["student"]["standard"],
                "subject_id": representation["subject"]["id"],
                "subject_number": representation["subject"]["subject_number"],
                "subject_name": representation["subject"]["subject_name"],
                "marks": representation["marks"],
                "created_at": representation["student"]["created_at"],
                "updated_at": representation["student"]["updated_at"],
            },
        }

        return custom_representation
