import fetch from "node-fetch";
import fs from "fs";
import express from "express";
import { Client as Eris } from "eris";

import * as strava from "./strava.js";
import * as db from "./db/index.js";
import * as bots from "./bots/index.js";
import { Console } from "console";

const app = express();
const port = 3000;

const bot = new Eris(process.env.DISCORD_TOKEN);
bot.connect();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// define a route handler for the default home page
app.get("/", (req, res) => {
    res.status(200).send("Hello world!");
});

app.get("/activity", (req, res) => {
    console.log("ACTIVITY");
    // strava.getActivity(6868712246)
    //     .then(res => res.json())
    //     .then(data => {
    //         console.log(data);
    //         res.status(200).send(data);
    //     })
    //     .catch(err => {
    //         console.error(err);
    //         res.status(400).send(err);
    //     })
});

app.get("/scoreUpdated", (req, res) => {
    res.status(200).send();
});

app.post("/scoreUpdated", async (req, res) => {
    const now = new Date();
    const date = now.toLocaleDateString("en-SG", { timeZone: "Asia/Singapore" });
    const time = now.toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore" });

    const scores = req.body.scores.sort((a, b) => b[1] - a[1]);
    scores.forEach((elem, index, arr) => {
        arr[index] = `${index + 1}. Team ${elem[0]}: ${elem[1]}`;
    });
    const message = `__Leaderboards__\nUpdated at ${date} ${time}\n` + "```\n" + scores.join('\n') + "```";

    const chats = JSON.parse(fs.readFileSync("./chats.json").toString());
    const tele = chats.telegram;
    const disc = chats.discord;

    bots.telegram.sendLeaderboard(message, tele.chat_id, tele.message_id)
        .then(res => res.json())
        .then(data => console.log("telegram leaderboard message_id:", data["result"].message_id))
        .catch(console.error);

    (disc.message_id
        ? bot.editMessage(disc.channel_id, disc.message_id, message)
        : bot.createMessage(disc.channel_id, message)
    )
        .then((data) => console.log("Discord success"))
        .catch(console.error);

    res.sendStatus(200);
});

app.get("/hook", (req, res) => {
    const hub = req.query; // Strava subscription validation
    const body = { ...hub, statusCode: 200 };
    res.send(body);
});

app.post("/hook", async (req, res) => {
    const event = req.body;
    console.log("event", event);
    // only process 'create' events that are of type 'activity'
    if (event.aspect_type !== "create" || event.object_type !== "activity") {
        res.status(201).send('EVENT_RECEIVED');
    } else {
        const accessToken = await db.tokens.get(event.owner_id);

        strava.getActivity(event.object_id, accessToken)
            .then(res => res.json())
            .then(data => {
                res.status(202).send();
                return data;
            })
            .then(async run => {
                if (!run["distance"]) return;
                const content = `${run["name"]}\ndistance: ${run["distance"]}m\nelapsed time: ${run["moving_time"]}s\naverage speed: ${run["average_speed"]}`;
                const athleteReq = await strava.athlete(accessToken);
                const athlete = await athleteReq.json();
                const username = `${athlete["firstname"]} ${athlete["lastname"]}`;
                const avatar_url = athlete["profile"];
                const params = new URLSearchParams({
                    content, username
                })
                return fetch(process.env.DISCORD_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params
                });
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.error(err);
                res.status(400).send();
            })
        // const params = new URLSearchParams(event);
        // res.redirect("activity")
        // // res.redirect("/activity?" + params.toString());
    }
});

app.get("/exchange_token", async (req, res) => {
    if (req.query.error) {
        // handle error
    }

    // short-lived authorization code to be exchanged for refresh and access tokens
    const code = req.query.code.toString();

    // scope; should be "read,activity:read_all"
    const scopes = req.query.scope.toString().split(',');
    if (!scopes[1] || scopes[1] !== "activity:read_all") {
        res.send("Please allow read activity permissions. <a href='https://www.strava.com/oauth/authorize?client_id=76731&response_type=code&redirect_uri=https://f071-121-7-236-112.ngrok.io/exchange_token&approval_prompt=force&scope=read,activity:read_all'>try again</>");
        return;
    }

    // complete authentication process
    strava.authorize(code)
        .then(res => res.json())
        .then(data => {
            const athlete_id = data["athlete"].id;
            const expires_at = data["expires_at"];
            const refresh_token = data["refresh_token"];
            const access_token = data["access_token"];
            return db.tokens.insert({
                athlete_id, expires_at, refresh_token, access_token
            });
        })
        .then(sres => {
            res.send("Successfully authorized!");
        })
        .catch(console.error);

    // res.redirect("/authorized");
});

app.get("/authorized", (req, res) => {
    console.log(import.meta.url);
    res.sendFile(import.meta.url + "/authorized.html");
})
// start the Express server
app.listen(process.env.PORT, () => {
    console.log(`server started at port ${process.env.PORT}`);
});
