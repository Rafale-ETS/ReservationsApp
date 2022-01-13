//$('#np_d1_s1').on('input', function(e) {
//    alert('Changed!')
//});

$(document).ready(function() {
    console.log("Populating current week... ");

    let max_people = 5

    db.get_current_week((res) => {
        this.current_week = new WeekModel(res, true, max_people);
        this.current_week.getDomRpr().appendTo($("#current-week"));
    });

    db.get_previous_weeks((res) => {
        this.p_week_1 = new WeekModel(res[0], false, max_people);
        this.p_week_2 = new WeekModel(res[1], false, max_people);

        this.p_week_1.getDomRpr().appendTo($("#p-week-1"));
        this.p_week_2.getDomRpr().appendTo($("#p-week-2"));
    })

    $('#btn-save').click(() => {
        console.log("Button clicked");

        data = []
        $("#current-week .day").each((id) => {
            let day = { "slots": [] };

            let slots = $($(".day")[id]).children(".slot");
            slots.each(id => {
                let slot = { "people": [] };

                let new_name = $(slots[id]).children(".new-person")[0];
                if (new_name && $(new_name).val() != "") {
                    slot["people"].push($(new_name).val());
                } else {
                    slot["people"].push("_none");
                }

                console.log(slot["people"]);
                day["slots"].push(slot);

            });

            data.push(day);
        });

        console.log(data);
        db.update_new_people(data);

        location.reload();
    })
});