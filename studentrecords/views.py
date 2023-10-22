import os
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from studentrecords.settings import MEDIA_ROOT
from .models import Report, Students, Subjects
import random
from .serializer import (
    StudentSerializer,
    CustomMarkSheetSerializer,
)
from urllib.parse import urlparse


@api_view(["GET"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
def get_students(request):
    data_fields = request.query_params.get("data", "")
    class_fields = request.query_params.get("class", "")
    base_url = get_base_url(request)
    if not data_fields and not class_fields:
        marksheet = Report.objects.all()
        result = CustomMarkSheetSerializer(marksheet, many=True)
        students = student_api_json(result, base_url)
        return Response(students)
    elif not data_fields and class_fields:
        class_fields = class_fields.split(",")
        total = []
        for standard in class_fields:
            marksheet = Report.objects.filter(roll_number__standard=standard)
            result = CustomMarkSheetSerializer(marksheet, many=True)
            students = student_api_json(result, base_url)
            total += students
        return Response(total)
    elif data_fields and not class_fields:
        data_fields = data_fields.split(",")
        if "roll" in data_fields:
            index = data_fields.index("roll")
            data_fields[index] = "roll_number"
        if "score total" in data_fields:
            index = data_fields.index("score total")
            data_fields[index] = "total"
        marksheet = Report.objects.all()
        result = CustomMarkSheetSerializer(marksheet, many=True)
        students = student_api_json(result, base_url)
        students_data = []
        for data in students:
            temp = {}
            for key, value in data.items():
                if key in data_fields:
                    temp[key] = value
            students_data.append(temp)
        return Response(students_data)


@api_view(["PUT"])
def update_student(request, id):
    student = get_object_or_404(Students, id=id)
    if request.method == "PUT":
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(
                {"message": "Student updated successfully."}, status=200
            )
        return JsonResponse(serializer.errors, status=400)


@api_view(["DELETE"])
def delete_student(request, id):
    student = get_object_or_404(Students, id=id)
    if request.method == "DELETE":
        student.delete()
        if student.photo:
            storage, path = student.photo.storage, student.photo.path
            storage.delete(path)
        return JsonResponse({"message": "Student deleted successfully."}, status=200)


def overview(request):
    context = {
        "total_students": Students.objects.count(),
        "total_subjects": Subjects.objects.count(),
        "total_records": Report.objects.count(),
    }
    return render(request, "overview.html", context)


def add_students(request):
    if request.method != "POST":
        return HttpResponse("Only POST requests are allowed")
    student_roll_number = request.POST.get("roll_number")
    student_name = request.POST.get("student_name")
    student_class = request.POST.get("student_class")
    student_photo = request.FILES.get("student_photo")
    subject_ids = request.POST.get("subject_ids", "").split(",")
    subject_names = request.POST.get("subject_names", "").split(",")
    subject_scores = request.POST.get("subject_scores", "").split(",")
    if not student_roll_number:
        student_roll_number = random.randint(1000000, 9999999)
    try:
        student = Students.objects.get(roll_number=student_roll_number)
        return JsonResponse(
            {
                "title": "RollNumber already exists.",
                "msg": f"Student with roll number {student_roll_number} already exists",
            },
            status=200,
            safe=False,
        )
    except Students.DoesNotExist:
        student = Students()
        student.name = student_name
        student.standard = student_class
        student.roll_number = student_roll_number
        student.save()
        student_id = student.id
        file_name = upload_file_to_media(
            student_photo=student_photo, student_id=student_id
        )
        student = Students.objects.get(id=student_id)
        student.photo = f"{file_name}"
        student.save()
        for subject_id, subject_name, subject_score in zip(
            subject_ids, subject_names, subject_scores
        ):
            try:
                subject = Subjects.objects.get(subject_name=subject_name)
            except Subjects.DoesNotExist:
                subject = Subjects()
                subject.subject_number = subject_id
                subject.subject_name = subject_name
                subject.save()
            marksheet = Report()
            marksheet.roll_number = student
            marksheet.subject_id = subject
            marksheet.marks = subject_score
            marksheet.save()
        return JsonResponse(
            {
                "title": "Student added.",
                "msg": f"Student with roll number {student_roll_number} added",
            },
            status=200,
            safe=False,
        )


def update_student_info(request, id):
    if request.method != "POST":
        return HttpResponse("Only POST requests are allowed")
    student_id = id
    student_roll_number = request.POST.get("roll_number")
    student_name = request.POST.get("student_name")
    student_class = request.POST.get("student_class")
    student_photo = request.FILES.get("student_photo")
    subject_ids = request.POST.get("subject_ids", "").split(",")
    subject_names = request.POST.get("subject_names", "").split(",")
    subject_scores = request.POST.get("subject_scores", "").split(",")
    try:
        student = Students.objects.get(id=student_id)
        student.name = student_name
        student.standard = student_class
        student.roll_number = student_roll_number
        if student_photo:
            file_name = upload_file_to_media(
                student_photo=student_photo, student_id=student_id
            )
            student.photo = f"{file_name}"
        student.save()
        for subject_id, subject_name, subject_score in zip(
            subject_ids, subject_names, subject_scores
        ):
            try:
                subject = Subjects.objects.get(subject_name=subject_name)
            except Subjects.DoesNotExist:
                subject = Subjects()
            subject.subject_number = subject_id
            subject.subject_name = subject_name
            subject.save()
            subject = Subjects.objects.get(subject_name=subject_name)
            try:
                Report.subject_id
                marksheet = Report.objects.get(
                    subject_id__id=subject.id, roll_number__id=student_id
                )
            except Report.DoesNotExist:
                marksheet = Report()
            marksheet.roll_number = student
            marksheet.subject_id = subject
            marksheet.marks = subject_score
            marksheet.save()
        return JsonResponse(
            {
                "title": "Student Updated.",
                "msg": f"Student with roll number {student_roll_number} updated",
            },
            status=200,
            safe=False,
        )
    except Students.DoesNotExist:
        return JsonResponse(
            {
                "title": "Student Not exists.",
                "msg": "Please select a valid student.",
            },
            status=200,
            safe=False,
        )


def students(request):
    return render(request, "students.html", {})


def all_students(request, id=0):
    base_url = get_base_url(request)
    if not id:
        marksheet = Report.objects.all()
        result = CustomMarkSheetSerializer(marksheet, many=True)
        context = student_api_json(result, base_url)
    else:
        try:
            marksheet_records = Report.objects.filter(roll_number__id=id)
            result = CustomMarkSheetSerializer(marksheet_records, many=True)
            students = student_api_json(result, base_url)
            context = students
        except Students.DoesNotExist:
            context = {"msg": "Student not found"}
    return JsonResponse(data=context, safe=False)


def upload_file_to_media(student_photo, student_id):
    CHECK_FOLDER = os.path.isdir(MEDIA_ROOT)
    if not CHECK_FOLDER:
        os.makedirs(MEDIA_ROOT)

    filename = (
        student_photo.name.replace(" ", "_")
        .replace("@", "")
        .replace("(", "")
        .replace(")", "")
    )
    extension = filename.split(".")[1]
    filename = f"{student_id}.{extension}"

    with open(os.path.join(MEDIA_ROOT, filename), "wb") as actual_file:
        actual_file.write(student_photo.read())
    return filename


def get_base_url(request):
    full_url = request.build_absolute_uri()
    parsed_url = urlparse(full_url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    return base_url


def student_api_json(result, base_url):
    student_data = {}
    for record in result.data:
        student_id = record["student"]["id"]
        if student_id not in student_data:
            student_data[student_id] = {
                "id": record["student"]["id"],
                "name": record["student"]["name"],
                "roll_number": record["student"]["roll_number"],
                "class": record["student"]["class"],
                "photo": f'{base_url}{record["student"]["photo"]}',
                "subjects": [],
                "total": 0,
            }
        student_data[student_id]["subjects"].append(
            {
                "id": record["student"]["subject_id"],
                "subject_number": record["student"]["subject_number"],
                "subject_name": record["student"]["subject_name"],
                "marks": record["student"]["marks"],
            }
        )
        student_data[student_id]["total"] += record["student"]["marks"]
    return list(student_data.values())


def delete_student_info(request, id):
    if request.method != "POST":
        return HttpResponse("Only POST requests are allowed")
    try:
        marksheet_records = Report.objects.filter(roll_number__id=id)
        for i in marksheet_records:
            i.roll_number.delete()
        marksheet_records.delete()
        return JsonResponse(
            {
                "title": "Request Sent successfully.",
                "msg": "Student deleted successfully.",
            },
            status=200,
            safe=False,
        )
    except Report.DoesNotExist:
        return JsonResponse(
            {
                "title": "Student Not exists.",
                "msg": "Please select a valid student.",
            },
            status=200,
            safe=False,
        )
