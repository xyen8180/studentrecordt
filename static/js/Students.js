import { StudentModal } from "./Student_modal.js";
import { Table } from "./Table.js";
import { successToast } from "./Toast.js";
import { xhr } from "./xmlHttpRequest.js";

export class StudentTable extends Table {
    interval_id = 0
    pool_interval = 15
    status_filter = null
    urls = {
        "get": '/student_list/',
        "delete": "/delete_student_info/"
    }
    $loader = $(".loader")

    table_rows = () => {
        let tablebody = $('#tbody');
        tablebody.empty()
        for (var ele of this.paginatedData.rows) {
            let subjects = this.subject_table_data(ele.subjects)
            var row = `
            <tr>
                <td>${ele.roll_number}</td>
                <td>${ele.name}</td>
                <td>${ele.class}</td>
                ${subjects}
                <td>${ele.total}</td>
                <td>
                    <div class="qr_icon" style="justify-content: space-between;">
                        <a target="_blank" href="${ele.photo}" style="font-size: 20px;color: #5C7CFA;"><i class="uil uil-image"></i></a>
                        <i onclick="editStudent(${ele.id})" style="font-size: 20px;" class="uil uil-pen"></i>
                        <i onclick="deleteStudent(${ele.id})" style="font-size: 20px;color: #F93131;" class="uil uil-trash"></i>
                    </div>
                </td>
            </tr>
        `
            tablebody.append(row)
        }
    }

    subject_table_data(subjects) {
        let rows = ''
        for (let i = 0; i < 5; i++) {
            if (subjects[i]) {
                rows += `<td>${subjects[i].subject_name} - ${subjects[i].marks}</td>`;
            } else {
                rows += '<td>Not Added</td>';
            }
        }
        return rows
    }

    constructor(options) {
        super(options)
        this.get()
        window.deleteStudent = (id) => {
            var fd = new FormData();
            fd.append("csrfmiddlewaretoken", $('[name="csrfmiddlewaretoken"]').val());
            xhr.post(this.urls.delete + id, fd, (response) => {
                successToast({
                    title: response.title,
                    message: response.msg
                });
                this.get()
            });
        }
    }

    get() {
        xhr.get(this.urls.get, (response) => {
            this.response = response
            this.check_empty_state(response);
            this.$loader.css("display", "none");
        })
    };

}


var student = new StudentTable({
    "search_box": $('#customsearchbox'),
    "per_page_result": 10,
    "search_by": "roll_number",
});

var student_modal = new StudentModal()
student_modal.page_obj = student