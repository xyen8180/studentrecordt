import django
from django.db import models


class Subjects(models.Model):
    id = models.BigAutoField(primary_key=True)
    subject_number = models.IntegerField(null=True)
    subject_name = models.CharField(max_length=1000)
    created_at = models.DateTimeField(default=django.utils.timezone.now)

    class Meta:
        db_table = "subjects"

    def __str__(self):
        return str(self.name)


class Students(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=1000)
    roll_number = models.IntegerField(db_index=True, unique=True)
    standard = models.IntegerField()
    photo = models.ImageField(upload_to="student_images/", null=True, blank=True)
    created_at = models.DateTimeField(default=django.utils.timezone.now)
    updated_at = models.DateTimeField(default=django.utils.timezone.now)

    class Meta:
        db_table = "students"

    def __str__(self):
        return str(self.name)


class Report(models.Model):
    roll_number = models.ForeignKey(
        Students,
        to_field="roll_number",
        verbose_name=("student_roll_number"),
        on_delete=models.CASCADE,
        null=True,
        related_name="marksheets",
    )
    subject_id = models.ForeignKey(
        Subjects,
        to_field="id",
        verbose_name=("student_roll_number"),
        on_delete=models.CASCADE,
        null=True,
        related_name="marksheets",
    )
    marks = models.FloatField()

    class Meta:
        db_table = "marksheet"

    def __str__(self):
        return f"{self.roll_number} - {self.subject_id}"
