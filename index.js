const express = require('express');
const app = express();
const port = 3580;

const database = require('./db');
var db = new database.JSONdb();

app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

//Website path
app.get('/', (req, res) => {
    console.debug(`Got a request on "/" by client ${req.ip}, sending the html page.`);
    res.sendFile("html/index.html", { root: __dirname });
})

app.use(express.static('html'));

// api paths
app.post("/api/set/", (req, res) => {
    // wierd switcheroo to decode properly into an array... 
    str_data = JSON.stringify(req.body["data"])
    db.update_current_week(JSON.parse(str_data));
})

app.get("/api/get/current/", (req, res) => {
    res.json(db.get_current_week());
})

app.get("/api/get/previous/", (req, res) => {
    res.json(db.get_past_weeks());
})

app.get("/api/get/maxpeople/", (req, res) => {
    res.json(db.get_max_people());
})

// Entry point
app.listen(port, () => {
    console.log(`App is listening on localhost:${port}`)
})