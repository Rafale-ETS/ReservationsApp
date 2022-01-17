const res = require('express/lib/response');
const filesys = require('fs');
const luxon = require('luxon');

const nbr_names_per_slot = 5
const nbr_working_day = 5;
const default_slots = [
    { "start": "09:00", "end": "12:00" },
    { "start": "13:00", "end": "15:00" },
    { "start": "15:00", "end": "17:00" },
    { "start": "18:00", "end": "20:00" }
]

class Slot {
    constructor(start_time, end_time) {
        this.start_time = start_time;
        this.end_time = end_time;
        this.people = []
        this.is_full = false;
    }

    addPerson(name) {
        if (this.people.length < nbr_names_per_slot) {
            this.people.push(name);
            if (this.people.length >= nbr_names_per_slot) {
                this.is_full = true;
            }
            return true;
        } else {
            this.is_full = true;
            return false;
        }
    }
}

class Day {
    constructor(date, slots_cfg = default_slots) {
        this.date = date;
        this.slots = [];
        slots_cfg.forEach(cfg => {
            this.slots.push(new Slot(cfg["start"], cfg["end"]));
        });
    }
}

function day_of_month(year, week_num, week_day) {
    return luxon.DateTime.fromObject({
        weekYear: year,
        weekNumber: week_num,
        weekday: week_day
    });
}

function new_week(year, week) {
    let days = [];
    for (let i = 0; i < nbr_working_day; i++) {
        days.push(new Day(day_of_month(year, week, i + 1).toISODate()));
    }
    let week_data = {
        "year": year,
        "week": week,
        "days": days
    };

    return week_data;
}

function populate_week_data(parsed_week_data) {
    let parsed_days = []
    let slot_cfg = []

    parsed_week_data["days"][0]["slots"].forEach(p_slot => {
        slot_cfg.push({
            "start": p_slot["start_time"],
            "end": p_slot["end_time"]
        });
    })

    parsed_week_data["days"].forEach(p_day => {
        let n_day = new Day(p_day["date"], slot_cfg);
        n_day.slots.forEach((slot, idx) => {
            p_day["slots"][idx]["people"].forEach((name) => {
                slot.addPerson(name);
            })
            slot.is_full = p_day["slots"][idx]["is_full"];
        })
        parsed_days.push(n_day);
    });

    let week_data = {
        "year": parsed_week_data["year"],
        "week": parsed_week_data["week"],
        "days": parsed_days
    }

    console.log("Week data:");
    console.log(JSON.stringify(JSON.stringify(week_data)));
    return week_data;
}

module.exports = {
    JSONdb: class JSONdb {

        FILEPATH = "./db/database.json"

        constructor() {
            this.current_week_data = {};
            let current_date = luxon.DateTime.now();

            if (filesys.existsSync(this.FILEPATH)) {
                let json_str = filesys.readFileSync(this.FILEPATH, { encoding: 'utf8', flag: 'r' });
                let parsed_data = JSON.parse(json_str);

                let parsed_current_week = parsed_data.find((value, index, obj) => {
                    return (value["year"] == current_date.weekYear) && (value["week"] == current_date.weekNumber);
                });

                console.log("current parsed week");
                console.log(JSON.stringify(parsed_current_week));

                if (parsed_current_week == undefined) {
                    this.current_week_data = new_week(current_date.weekYear, current_date.weekNumber);
                } else {
                    this.current_week_data = populate_week_data(parsed_current_week);
                }

                console.log("current week");
                console.log(JSON.stringify(this.current_week_data));

            } else {
                this.current_week_data = new_week(current_date.weekYear, current_date.weekNumber);
                let list = [this.current_week_data]
                filesys.writeFileSync(this.FILEPATH, JSON.stringify(list));
            }

            //console.log(this.get_past_weeks());
            //console.log(this.get_current_week());
            this.get_current_week();
            this.get_past_weeks();

            this.syncronize_file();
        }

        get_current_week() {
            return JSON.stringify(this.current_week_data);
        }

        get_past_weeks() {
            let current_date = luxon.DateTime.now();
            let p_data = JSON.parse(filesys.readFileSync(this.FILEPATH, { encoding: 'utf8', flag: 'r' }));

            let date_past_1 = current_date.minus({ weeks: 1 })
            let date_past_2 = current_date.minus({ weeks: 2 })

            let past_week_1 = p_data.find((value, index, obj) => {
                return (value["year"] == date_past_1.weekYear) && (value["week"] == (date_past_1.weekNumber));
            });
            if (past_week_1 == undefined) {
                past_week_1 = new_week(date_past_1.weekYear, date_past_1.weekNumber);
            }

            let past_week_2 = p_data.find((value, index, obj) => {
                return (value["year"] == date_past_2.weekYear) && (value["week"] == (date_past_2.weekNumber));
            });
            if (past_week_2 == undefined) {
                past_week_2 = new_week(date_past_2.weekYear, date_past_2.weekNumber);
            }

            return JSON.stringify([past_week_1, past_week_2]);
        }

        syncronize_file() {
            let current_date = luxon.DateTime.now();

            filesys.readFile(this.FILEPATH, { encoding: 'utf8', flag: 'r' }, (err, data) => {
                let parsed_data = JSON.parse(data);

                let current_week_index = parsed_data.findIndex((value, index, obj) => {
                    return (value["year"] == current_date.weekYear) && (value["week"] == current_date.weekNumber);
                });

                if (current_week_index != -1) {
                    parsed_data[current_week_index] = this.current_week_data;
                } else {
                    parsed_data.push(this.current_week_data);
                }

                filesys.writeFileSync(this.FILEPATH, JSON.stringify(parsed_data));
            });
        }

        get_max_people() {
            return nbr_names_per_slot;
        }

        update_current_week(update_data) {

            console.log("Updating data.... ");
            console.log(JSON.stringify(update_data));

            update_data.forEach((day_data, day_id) => {
                day_data["slots"].forEach((slot_data, slot_id) => {
                    slot_data["people"].forEach(name => {
                        if (name != "_none") {
                            this.current_week_data["days"][day_id]["slots"][slot_id].addPerson(name);
                        }
                    })
                });
            });

            this.syncronize_file();
        }
    }
}