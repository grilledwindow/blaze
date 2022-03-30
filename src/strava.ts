import "dotenv/config";
import fetch from "node-fetch";

/*
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
      -F client_id=76731 \
      -F client_secret=05e1dcff64744b371c6bf13e6d421a6e67dacacc \
      -F 'callback_url=https://f071-121-7-236-112.ngrok.io/hook' \
      -F 'verify_token=STRAVA'

curl -G https://www.strava.com/api/v3/push_subscriptions \
    -d client_id=76731 \
    -d client_secret=05e1dcff64744b371c6bf13e6d421a6e67dacacc

curl -X DELETE https://www.strava.com/api/v3/push_subscriptions/214754 \
    -F client_id=76731 \
    -F client_secret=05e1dcff64744b371c6bf13e6d421a6e67dacacc
*/

export const getActivity = async (activityId: number, accessToken: string) => {
    const url = new URL("https://www.strava.com/api/v3/activities/" + activityId);
    const params = new URLSearchParams({
        include_all_efforts: "true",
    });
    url.search = params.toString();

    return fetch(url.toString(), {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
    });
};

export const athlete = async (accessToken: string) => {
    return fetch("https://www.strava.com/api/v3/athlete", {
        headers: {
            "Authorization": "Bearer " + accessToken
            // + process.env.STRAVA_CLIENT_SECRET
        },
    });
}

export const webhook = async () => {
    const body = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        callback_url: "http://6419-121-7-236-112.ngrok.io/hook",
        verify_token: "STRAVA",
    });

    return fetch("https://www.strava.com/api/v3/push_subscriptions", {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body
    });
};

export const refreshAccessToken = async (refresh_token: string) => {
    const body = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token,
    });

    return fetch("https://www.strava.com/api/v3/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
};

export const authorize = async (code: string) => {
    const body = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
    });

    return fetch("https://www.strava.com/api/v3/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
};