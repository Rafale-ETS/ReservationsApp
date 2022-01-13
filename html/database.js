class Database {
    constructor() {
        this.api_url_get_current = "/api/get/current/";
        this.api_url_get_previous = "/api/get/previous/";
        this.api_url_get_max_people = "/api/get/maxpeople/";
        this.api_url_set = "/api/set/";
    }

    get_previous_weeks(callback) {
        $.get(this.api_url_get_previous).done((res) => {
            callback(JSON.parse(res));
        });
    }

    get_current_week(callback) {
        $.get(this.api_url_get_current).done((res) => {
            callback(JSON.parse(res));
        });
    }

    update_new_people(payload_data) {
        console.log(JSON.stringify({ "data": payload_data }));
        $.post(this.api_url_set, { "data": payload_data }, null, "json").done()
    }
}

$(document).ready(function() {
    db = new Database();
});