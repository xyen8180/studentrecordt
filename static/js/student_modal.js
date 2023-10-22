import { successToast } from "./Toast.js"
import { xhr } from "./xmlHttpRequest.js"

export class StudentModal {
    $modal = document.querySelector("#studentModal")
    $modalOpenBtn = document.querySelector("#AddStudentModalBtn")
    $modalCloseBtn = document.querySelector("#closeStudentModalBtn")
    $modalHeader = document.querySelector("#cm-modalheader")
    $addBtn = document.querySelector("#addupdatechargerbtn")
    $updateBtn = document.querySelector("#updatechargerbtn")
    $subjectTableTBody = document.querySelector("#add_connector_tbody")
    $addNewSubjectRowBtn = document.querySelector("#add_new_connector_row")
    deleted_connectors_id = []
    urls = {
        "post": "/add_student/",
        "get": "/student_list/",
        "update": "/update_student_info/"
    }
    page_obj = null
    $studentName = document.querySelector("#cm-studentName")
    $rollNumber = document.querySelector("#cm-student_roll")
    $class = document.querySelector("#cm-class")
    $logoViewerContainer = $('.logo-viewer')
    $logoViewer = $('.logo-viewer>img')
    student_index = null
    modal = {
        "get": {
            "studentName": () => this.$studentName.value,
            "rollNumber": () => this.$rollNumber.value,
            "class": () => this.$class.value,
            "subjectIds": () => {
                let connector_ids = $.map(document.getElementsByName('cm-connector_id'), (id) => {
                    return Number($(id).text());
                });
                return connector_ids
            },
            "subjectNames": () => {
                let connector_type = $.map(document.getElementsByName('cm-connectortype'), (type) => {
                    return $(type).val();
                });
                return connector_type
            },
            "subjectScores": () => {
                let connector_output = $.map(document.getElementsByName('cm-connectoroutput'), (op) => {
                    return Number($(op).val());
                });
                return connector_output
            },
        },
        "set": {
            "studentName": (value) => this.$studentName.value = value,
            "rollNumber": (value) => this.$rollNumber.value = value,
            "class": (value) => this.$class.value = value,
        },
    }

    constructor() {
        this.events()
        this.updatecharger = this.updatecharger.bind(this)
    }

    set_subject_table(subjects) {
        $(this.$subjectTableTBody).empty();
        for (var subject of subjects) {
            var row = `
                <tr>
                    <td name="cm-connector_id">${subject.subject_number}</td>
                    <td>
                        <input type="text" name="cm-connectortype" id="cm-connectortype" required>
                    </td>
                    <td>
                        <input type="number" name="cm-connectoroutput" id="cm-connectoroutput"
                            pattern="[0-9]+([\.,][0-9]+)?" step="0.01"
                            title="This should be a number or decimal">
                    </td>
                    <td><i onclick="delete_connector_row(event)" class="uil uil-trash-alt"></i></td>
                </tr>
            `
            $(this.$subjectTableTBody).append(row)
            $('[name="cm-connectortype"]:last').val(subject.subject_name)
            $('[name="cm-connectoroutput"]:last').val(subject.marks)
        }
    }

    set_student_details(student) {
        this.modal.set.studentName(student.name)
        this.modal.set.class(student.class)
        this.modal.set.rollNumber(student.roll_number)
        this.set_subject_table(student.subjects)
        document.querySelector('.logo-viewer>img').src = student.photo;
        this.open_edit_modal()
    }

    events() {
        window.previewFile = () => {
            const file = document.querySelector('#bm-org_logo').files[0];
            const reader = new FileReader();

            reader.addEventListener("load", () => {
                document.querySelector('.logo-viewer>img').src = reader.result;
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
        }
        this.$modalOpenBtn.onclick = () => {
            this.open_modal()
        };
        this.$modalCloseBtn.onclick = () => {
            this.close_modal()
        }
        document.querySelector('#cancelStudentModalBtn').onclick = () => {
            this.close_modal()
        }
        window.editStudent = (id) => {
            this.id = id
            xhr.get(this.urls.get + id, (response) => {
                this.set_student_details(response[0])
            })
        }

        window.delete_connector_row = (e) => {
            var connectorRow = e.target.parentElement.parentElement;
            this.deleted_connectors_id.push(Number($(connectorRow).children(":first").text()));
            this.deleted_connectors_id.sort();
            $(connectorRow).remove();
        }

        this.$addNewSubjectRowBtn.onclick = () => {
            this.add_new_connector_row()
        };
        this.$addBtn.onclick = (e) => {
            e.preventDefault();
            var form = $(this.$modal).find("form")
            if (form[0].checkValidity()) {
                this.add_student();
            }
            else {
                form[0].reportValidity()
            }
        };

        this.$updateBtn.onclick = (e) => {
            e.preventDefault();
            var form = $(this.$modal).find("form")
            if (form[0].checkValidity()) {
                this.update_student();
            }
            else {
                form[0].reportValidity()
            }
        };
    }

    open_modal() {
        this.clear_modal();
        this.$modalHeader.innerHTML = "Add Student";
        this.$updateBtn.style.display = "none"
        this.$addBtn.style.display = "flex"
        this.$modal.style.display = "flex";
    }

    open_edit_modal() {
        $('#bm-org_logo').attr('required', false)
        this.$modalHeader.innerHTML = "Edit Student";
        this.$updateBtn.style.display = "flex"
        this.$addBtn.style.display = "none"
        this.$modal.style.display = "flex";
    }

    close_modal() {
        this.clear_modal();
        $(this.$modal).css("display", "none");
    }

    add_new_connector_row() {
        var existing_id = this.$subjectTableTBody.children.length;
        var existing_row = this.$subjectTableTBody.children;
        var existing_total = 0;
        var expected_id = existing_id + 1;
        var expected_total = 0;

        for (var i = 0; i < existing_id; i++) {
            existing_total =
                existing_total + Number($(existing_row[i]).children(":first").text());
        }
        for (var i = 1; i <= expected_id; i++) {
            expected_total += i;
        }

        var connector_id = 0;
        if (this.deleted_connectors_id.length) {
            connector_id = this.deleted_connectors_id.shift();
        } else {
            if (expected_total > existing_total) {
                connector_id = expected_total - existing_total;
            }
            if (expected_total < existing_total) {
                connector_id = existing_total - expected_total;
            }
        }
        var row = `
                <tr>
                    <td name="cm-connector_id">${connector_id}</td>
                    <td>
                        <input type="text" name="cm-connectortype" id="cm-connectortype" required>
                    </td>
                    <td>
                        <input type="number" name="cm-connectoroutput" id="cm-connectoroutput"
                            pattern="[0-9]+([\.,][0-9]+)?" step="0.01"
                            title="This should be a number or decimal">
                    </td>
                    <td><i onclick="delete_connector_row(event)" class="uil uil-trash-alt"></i></td>
                </tr>
            `;
        $(this.$subjectTableTBody).append(row)

    }

    add_student() {
        // $(this.$addBtn).prop("disabled", true);
        let file = $('#bm-org_logo')
        file = file[0].files[0]
        var fd = new FormData();
        fd.append("csrfmiddlewaretoken", $('[name="csrfmiddlewaretoken"]').val());
        fd.append("subject_ids", this.modal.get.subjectIds());
        fd.append("subject_names", this.modal.get.subjectNames());
        fd.append("subject_scores", this.modal.get.subjectScores());
        fd.append("student_class", this.modal.get.class());
        fd.append("roll_number", this.modal.get.rollNumber());
        fd.append("student_name", this.modal.get.studentName());
        fd.append("student_photo", file)
        xhr.post(this.urls.post, fd, (response) => {
            if (this.page_obj != null) this.page_obj.get()
            successToast({
                title: response.title,
                message: response.msg
            });
        });
        this.close_modal();
        $(this.$addBtn).prop("disabled", false);
    }

    clear_modal() {
        this.modal.set.class("")
        this.modal.set.rollNumber("")
        this.modal.set.studentName("")
        $(this.$subjectTableTBody).empty();
        this.$addNewSubjectRowBtn.click();
    }


    update_student() {
        $(this.$updateBtn).prop("disabled", true);
        let file = $('#bm-org_logo')
        file = file[0].files[0]
        var fd = new FormData();
        fd.append("csrfmiddlewaretoken", $('[name="csrfmiddlewaretoken"]').val());
        fd.append("subject_ids", this.modal.get.subjectIds());
        fd.append("subject_names", this.modal.get.subjectNames());
        fd.append("subject_scores", this.modal.get.subjectScores());
        fd.append("student_class", this.modal.get.class());
        fd.append("roll_number", this.modal.get.rollNumber());
        fd.append("student_name", this.modal.get.studentName());
        file ? fd.append("student_photo", file) : ''
        xhr.post(this.urls.update + this.id, fd, (response) => {
            successToast({
                title: response.title,
                message: response.msg
            });
            if (!this.page_obj) this.page_obj.get()
        });
        $(this.$updateBtn).prop("disabled", false);
        this.id = null
        this.close_modal()
        $('#bm-org_logo').attr('required', true)
    }
}

