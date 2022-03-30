import * as strava from "../strava.js";
import { supabase } from "./client.js";
import { Token } from "../types.js";

export const insert = (token: Token) => {
    return supabase.rpc("insert_token", token);
};

export const get = async (athlete_id: number): Promise<string> => {
    const { data, error } = await supabase
        .rpc("get_token", { athlete_id });

    console.log(data);
    console.log(error);
    let accessToken = data["access_token"];
    if (!accessToken || error) {
        const res = await strava.refreshAccessToken(data["refresh_token"]);
        const _data = await res.json();
        console.log(_data);
        accessToken = _data["access_token"];
    }
    return accessToken;
};

export const update = async (token: Token) => {
    const { data, error } = await supabase
        .rpc("update_token", token);
    console.log(data, error);
};