
const DEFAULT_OPTIONS = {
    $dateToggles: null,
    $searchBox: null,
    $emptyScreen: $('.empty'),
    $tableBody: $('#tbody'),
    $tablefooter: {
        "left": $('.uil-angle-left-b'),
        "right": $('.uil-angle-right-b'),
        "text": $('.footerdata')
    },
    state: {
        "queryset": "",
        "page": 1,
        "rows": 4
    },
    searchBy: null
}



export class Table {
    paginatedData = null
    tableData = null
    constructor(options) {
        Object.entries({ ...DEFAULT_OPTIONS, ...options }).forEach(([key, value]) => {
            this[key] = value
        });
        if (this.$tablefooter != null) {
            this.table_footer_events()
        }
        if (this.$dateToggles != null) {
            this.show_toggled_table_data_on_load()
        }
    }

    set table_footer(footer) {
        this.$tablefooter = footer
    }

    set date_toggles(toggle) {
        this.$dateToggles = toggle
    }

    set table_data(data) {
        this.tableData = data
        this.state.queryset = data
    }

    set per_page_result(rows) {
        this.state.rows = rows
    }

    set search_by(ele) {
        this.searchBy = ele
    }

    set search_box(ele) {
        this.$searchBox = ele
        this.$searchBox.on("keyup", () => {
            let filter = this.$searchBox.val().toUpperCase();
            if (this.tableData.custom) {
                this.state.queryset = this.check_empty_sessions(this.tableData.custom)
                this.state.queryset = this.search(this.state.queryset, filter);
            }
            else {
                this.processPage(this.tableData);
            }
            this.buildtable();
        });
    }

    set set_empty_screen(ele) {
        this.$emptyScreen = ele
    }

    table_footer_events = () => {
        this.$tablefooter.left.on("click", () => {
            this.state.page = this.$tablefooter.left.attr("data-value");
            this.buildtable();
        });

        this.$tablefooter.right.on("click", () => {
            this.state.page = this.$tablefooter.right.attr("data-value");
            this.buildtable();
        });
    }

    show_toggled_table_data_on_load = () => {
        this.$dateToggles.today.on("click", () => {
            this.state.queryset = this.check_empty_sessions(this.tableData.today);
            if (this.$searchBox != null && this.$searchBox.val()) {
                this.processPage();
            }
            this.buildtable();
        });

        this.$dateToggles.week.on("click", () => {
            this.state.queryset = this.check_empty_sessions(this.tableData.week);
            if (this.$searchBox != null && this.$searchBox.val()) {
                this.processPage();
            }
            this.buildtable();
        });

        this.$dateToggles.month.on("click", () => {
            this.state.queryset = this.check_empty_sessions(this.tableData.month);
            if (this.$searchBox != null && this.$searchBox.val()) {
                this.processPage();
            }
            this.buildtable();
        });
    }

    pagination(data, page, rows) {
        let trimStart = (page - 1) * rows;
        let trimEnd = trimStart + rows;
        let totalrows = data.length
        let Pages = Math.ceil(totalrows / rows);
        let trimmedData = data.slice(trimStart, trimEnd);
        return {
            'rows': trimmedData,
            'pages': Pages,
            'total': totalrows,
            'start': trimStart + 1,
            'end': (trimEnd <= totalrows) ? trimEnd : totalrows
        }
    }
    buildtable() {
        this.paginatedData = this.pagination(this.state.queryset, this.state.page, this.state.rows);

        if (this.state.page == 1) {
            this.$tablefooter.left.css("display", "none");
            this.$tablefooter.right.css("display", "flex");
            this.$tablefooter.text.text(this.paginatedData.start + "-" + this.paginatedData.end + " of " + this.paginatedData.total);
        }
        else {
            this.$tablefooter.left.css("display", "flex");
            this.$tablefooter.right.css("display", "flex");
            this.$tablefooter.text.text(this.paginatedData.start + "-" + this.paginatedData.end + " of " + this.paginatedData.total);
        }
        if (this.state.page >= this.paginatedData.pages) {
            this.$tablefooter.left.css("display", "flex");
            this.$tablefooter.right.css("display", "none");
            this.$tablefooter.text.text(this.paginatedData.start + "-" + this.paginatedData.end + " of " + this.paginatedData.total);
            if (this.state.page == 1) {
                this.$tablefooter.left.css("display", "none");
                this.$tablefooter.right.css("display", "none");
            }
        }

        this.$tablefooter.left.attr("data-value", Number(this.state.page) - 1);
        this.$tablefooter.right.attr("data-value", Number(this.state.page) + 1);
        this.table_rows()

    };

    table_rows = () => {
    }

    search = (data, filter) => {
        var res = []
        filter = String(filter)
        for (var ele of data) {
            var text = String(ele[this.searchBy]);
            if (text.toUpperCase().indexOf(filter) > -1) {
                res.push(ele)
            }
        }
        return res
    };

    processPage = (response) => {
        if (response != null) this.tableData = response
        if (this.$dateToggles != null) {
            if (this.$dateToggles.today.is(':checked')) {
                this.state.queryset = this.check_empty_sessions(this.tableData.today);
                if (this.$searchBox != null && this.$searchBox.val()) {
                    var filter = this.$searchBox.val().toUpperCase();
                    this.state.queryset = this.search(this.state.queryset, filter);
                }
                this.buildtable();
            }
            if (this.$dateToggles.week.is(':checked')) {
                this.state.queryset = this.check_empty_sessions(this.tableData.week);
                if (this.$searchBox != null && this.$searchBox.val()) {
                    filter = this.$searchBox.val().toUpperCase();
                    this.state.queryset = this.search(this.state.queryset, filter);
                }
                this.buildtable();
            }
            if (this.$dateToggles.month.is(':checked')) {
                this.state.queryset = this.check_empty_sessions(this.tableData.month);
                if (this.$searchBox != null && this.$searchBox.val()) {
                    filter = this.$searchBox.val().toUpperCase();
                    this.state.queryset = this.search(this.state.queryset, filter);
                }
                this.buildtable();
            }
        }
        else {
            this.state.queryset = this.check_empty_sessions(this.tableData);
            if (this.$searchBox != null && this.$searchBox.val()) {
                var filter = this.$searchBox.val().toUpperCase();
                this.state.queryset = this.search(this.state.queryset, filter);
            }
            this.buildtable();
        }
    }

    check_empty_state(response) {
        let table = this.$tableBody.parent()
        if (response == null || response.length <= 0) {
            table.css('display', 'none')
            this.$emptyScreen.css('display', 'flex')
            return
        }
        table.css('display', "table")
        this.$emptyScreen.css('display', 'none')
        this.processPage(response)
    }

    check_empty_sessions(response) {
        let table = this.$tableBody.parent()
        if (response == null || response.length <= 0) {
            table.css('display', 'none')
            this.$emptyScreen.css('display', 'flex')
            return []
        }
        table.css('display', "table")
        this.$emptyScreen.css('display', 'none')
        return response
    }


}