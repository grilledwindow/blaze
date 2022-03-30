import "dotenv/config";
// import * as Eris from "eris";

const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/`;
const chatId = -705546109;

const createLeaderboard = () => {
    fetch(url + "sendMessage", {
        method: "POST",
        headers: {}
    })
}