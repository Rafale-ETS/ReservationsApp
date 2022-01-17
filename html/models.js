class SlotModel {
    constructor(slot_data, parent_day_id, slot_id, in_current_week, max_people) {
        this.parent_day_id = parent_day_id;
        this.id = slot_id;
        this.in_current_week = in_current_week;
        this.is_full = slot_data["is_full"];
        this.max_people = max_people;

        this.start = slot_data["start_time"];
        this.end = slot_data["end_time"];
        this.people = slot_data["people"];

        //console.log(JSON.stringify(this));
    }

    getDomRpr() {
        this.rpr = $('<div></div>', {
            "id": "d" + this.parent_day_id + "-s" + this.slot_id,
            "class": "slot col-12 border-secondary"
        });

        $('<h6></h6>').text("De " + this.start + " à " + this.end).appendTo(this.rpr);

        let people_list = $('<div></div>', { "class": "people col-12" });
        this.people.forEach(name => {
            $('<div></div>', { "class": "name col-12" }).text(name).appendTo(people_list);
        });
        // Add empty "people" slots to fill to max.
        for (let i = this.people.length; i < this.max_people; i++) {
            $('<div></div>', { "class": "name col-12" }).text("--").appendTo(people_list);
        }
        people_list.appendTo(this.rpr);

        if (this.in_current_week == true) {

            let input = $('<input></input>', {
                "type": "text",
                "name": "new-person-d" + this.parent_day_id + "-s" + this.id,
                "id": "np-d" + this.parent_day_id + "-s" + this.id,
                "class": "new-person form-control border-success"
            })

            if (this.is_full == true) {
                input.prop('disabled', true);
                input.removeClass("border-success")
                input.addClass("border-secondary")
                input.addClass("bg-secondary")
            }

            input.appendTo(this.rpr);
        }

        return this.rpr;
    }
}

class DayModel {
    constructor(day_data, day_id, in_current_week, max_people) {
        this.id = day_id
        this.date = day_data["date"];
        this.slots = [];

        day_data["slots"].forEach((slot_data, slot_id) => {
            this.slots.push(new SlotModel(slot_data, this.id, slot_id, in_current_week, max_people));
        });
    }

    getDomRpr() {
        this.rpr = $('<div></div>', {
            "id": "d" + this.id,
            "class": "day col-sm border-secondary"
        });

        $('<h3></h3>').text(this.date).appendTo(this.rpr);

        this.slots.forEach(slot => {
            slot.getDomRpr().appendTo(this.rpr);
        });

        return this.rpr;
    }
}

class WeekModel {
    constructor(week_data, is_current, max_people) {
        this.days = []
        this.is_current = is_current

        week_data["days"].forEach((day_data, day_id) => {
            this.days.push(new DayModel(day_data, day_id, is_current, max_people));
        });
    }

    getDomRpr() {
        this.rpr = $('<div></div>', {
            "class": "week col-sm row"
        });

        if (this.is_current) {
            this.rpr.addClass("border-success")
        } else {
            this.rpr.addClass("border-warning")
        }

        this.days.forEach(day => {
            day.getDomRpr().appendTo(this.rpr);
        });

        return this.rpr;
    }
}