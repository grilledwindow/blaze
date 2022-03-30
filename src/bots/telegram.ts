import "dotenv/config";
import fetch from "node-fetch";

const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/`;

export const sendLeaderboard = (text: string, chat_id: number | string, message_id?: number | string) => {
    let method = "sendMessage";
    const params = new URLSearchParams({ chat_id: "" + chat_id, text, parse_mode: "MarkdownV2" });

    if (message_id) {
        params.append("message_id", "" + message_id);
        method = "editMessageText";
    }

    return fetch(url + method, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });
};
