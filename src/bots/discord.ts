import "dotenv/config";
import { Client as Eris } from "eris";

export const createLeaderboard = (bot: Eris, content: string, channel_id: number | string) => {
    return bot.createMessage("" + channel_id, content);
};

export const updateLeaderboard = (bot: Eris, content: string, channel_id: number | string, message_id: number | string) => {
    return bot.editMessage("" + channel_id, "" + message_id, content);
};