import { errorToast } from "./Toast.js";
import { infoToast } from "./Toast.js";
import { successToast } from "./Toast.js";

class HttpRequest {
    constructor() {

    }

    get(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                callback(response);
            } else if (xhr.status === 403) {
                document.write(xhr.responseText)
            } else {
                let response = JSON.parse(xhr.responseText);
                errorToast({
                    title: response.title ? response.title : "Error Occured",
                    message: response.msg ? response.msg : xhr.statusText
                })
            }
        };
        xhr.onerror = () => {
            console.error(xhr.statusText)
            errorToast({
                title: "Error Occured",
                message: xhr.statusText
            })
        };
        xhr.send();
    }

    post(url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                callback(response);
            } else if (xhr.status === 403) {
                document.write(xhr.responseText)
            }
            else {
                console.log(xhr.status)
                let response = JSON.parse(xhr.responseText);
                errorToast({
                    title: response.title ? response.title : "Error Occured",
                    message: response.msg ? response.msg : xhr.statusText
                })
            }
        };
        xhr.onerror = () => console.error(xhr.statusText);
        xhr.send(data);
    }

    post_with_progress(url, data, callback, onprogress) {
        let xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => onprogress(event)
        xhr.open("POST", url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                callback(response);
            } else if (xhr.status === 403) {
                document.write(xhr.responseText)
            }
            else {
                let response = JSON.parse(xhr.responseText);
                errorToast({
                    title: response.title ? response.title : "Error Occured",
                    message: response.msg ? response.msg : xhr.statusText
                })
            }
        }
        xhr.onerror = () => console.error(xhr.statusText);
        xhr.send(data);
    };
}



export const xhr = new HttpRequest()