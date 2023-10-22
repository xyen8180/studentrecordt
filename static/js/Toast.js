
const DEFAULT_OPTIONS = {
  autoclose: 5000,
  position: "hello",
  onclose: () => { },
  type: "info",
  title: "you didnt Specify title",
  message: "you didnt Specify message",
}

export default class Toast {
  #toastele
  #toastcontent
  #messagecontainer
  #autoclosetimeout
  #requestId

  constructor(options) {
    this.#toastele = document.createElement("div");
    this.#toastele.classList.add("mytoast");
    this.#requestId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.#toastele.classList.add("mytoast--active");
      })
    })
    Object.entries({ ...DEFAULT_OPTIONS, ...options }).forEach(([key, value]) => {
      this[key] = value
    });
  }

  set position(value) {
    const container = document.querySelector('.toastlist_container') || createContainer()
    container.append(this.#toastele)
  }

  set type(value) {
    this.#toastcontent = document.createElement("div");
    this.#toastcontent.classList.add("toastcontent");
    this.#toastele.append(this.#toastcontent);
    const inforow = `
      <div class="toasticon infotoast">
          <i class="uil uil-info-circle"></i>
      </div>
    `
    const successrow = `
      <div class="toasticon successtoast">
          <i class="uil uil-check-circle"></i>
      </div>
    `
    const warningrow = `
      <div class="toasticon warningtoast">
          <i class="uil uil-exclamation-triangle"></i>
      </div>
    `
    const errorrow = `
      <div class="toasticon errortoast">
          <i class="uil uil-times-circle"></i>
      </div>
    `

    if (value == "success") $(this.#toastcontent).append(successrow)
    if (value == "info") $(this.#toastcontent).append(inforow)
    if (value == "error") $(this.#toastcontent).append(errorrow)
    if (value == "warning") $(this.#toastcontent).append(warningrow)
  }

  set title(value) {
    this.#messagecontainer = document.createElement("div")
    this.#messagecontainer.classList.add("toastmessagecontainer")
    this.#toastcontent.append(this.#messagecontainer)
    const titlerow = `
      <div class="title">${value}</div>
    `
    $(this.#messagecontainer).append(titlerow)
  }

  set message(value) {
    const messagerow = `
      <div class="message">${value}</div>
    `
    $(this.#messagecontainer).append(messagerow)
    const closebtnrow = `
      <div class="toastclose">
        <i id="toastclose" class="uil uil-times closebutton"></i>
      </div>
    `
    $(this.#toastcontent).append(closebtnrow)
    $(this.#toastele.lastElementChild).on("click", () => this.remove())
  }

  set autoclose(value) {
    if (value === false) return
    if (this.#autoclosetimeout !== null) clearInterval(this.#autoclosetimeout)
    this.#autoclosetimeout = setTimeout(() => this.remove(), value)
  }

  remove() {
    const container = this.#toastele.parentElement
    this.#toastele.remove();
    cancelAnimationFrame(this.#requestId);
    this.onclose();
    if (container == null || container.hasChildNodes()) return
    container.remove()
  }
}

function createContainer() {
  const container = document.createElement("div")
  container.classList.add("toastlist_container")
  document.body.append(container)
  return container
}

export function successToast(object) {
  new Toast({
    type: "success",
    title: object.title,
    message: object.message,
    onclose: () => toast_to_notification("success", object.title, object.message)
  })
}

export function infoToast(object) {
  new Toast({
    type: "info",
    title: object.title,
    message: object.message,
    onclose: () => toast_to_notification("info", object.title, object.message)
  })
}

export function errorToast(object) {
  new Toast({
    type: "error",
    title: object.title,
    message: object.message,
    onclose: () => toast_to_notification("error", object.title, object.message)
  })
}

export function warningToast(object) {
  new Toast({
    type: "warning",
    title: object.title,
    message: object.message,
    onclose: () => toast_to_notification("warning", object.title, object.message)
  })
}

export function set_notification_header(n_date) {
  var a = moment()
  a = a.subtract(a.utcOffset(), "minutes");
  var date = a.format("YYYY-MM-DD")
  var day = a.format("dddd")
  if (date != n_date) {
    var row = `
            <div class="notificationdayheading" data-value=${n_date}>${n_date}</div>
        `
    $('#nf_otherdays').prepend(row);
    return $('.notificationdayheading[data-value=' + n_date + ']')
  }
  if (date == n_date) {
    var row = `
            <div class="notificationdayheading" data-value=${n_date}>Today</div>
        `
    $('#nf_today').append(row);
    return $('.notificationdayheading[data-value=' + n_date + ']')

  }
}

function toast_to_notification(type, title, message) {
  var toast_datetime = moment()
  var toast_date = toast_datetime.format("YYYY-MM-DD")
  var toast_time = toast_datetime.fromNow()
  var today_notifications = $('#nf_today').find('.notificationdayheading')
  var n_type = null
  var n_icon = null
  if (type.toUpperCase() == 'ERROR') n_type = "nferror", n_icon = "uil-times-circle"
  if (type.toUpperCase() == 'INFO') n_type = "nfinfo", n_icon = "uil-info-circle"
  if (type.toUpperCase() == 'WARNING') n_type = "nfwarning", n_icon = "uil-exclamation-triangle"
  if (type.toUpperCase() == 'SUCCESS') n_type = "nfsuccess", n_icon = "uil-check-circle"
  var row = `
                <div class="notificationcontainer">
                    <div class="notificationicon ${n_type}">
                        <i class="uil ${n_icon}"></i>
                    </div>
                    <div class="notificationcontents">
                        <div class="nfheadertimecontainer">
                            <div class="nfheader">${title}</div>
                            <div class="nftimeago">${toast_time}</div>
                        </div>
                        <div class="nfmessage">${message}</div>
                    </div>
                </div>
            `
  var today_notifications = today_notifications.length != 0 ? today_notifications : set_notification_header(toast_date)
  $(today_notifications).after(row)
  $('#nf_today').css("display", "block");
  $('.notificationdot').css("display", "block");
}