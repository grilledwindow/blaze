import { supabase } from "./client.js";
import { Chat } from "../types.js";

export const get = async (platform: string) => supabase.rpc("get_chat", { platform });
export const get_or_insert = (chat: Chat) => supabase.rpc("get_or_insert_chat", chat);
export const insert = (chat: Chat) => supabase.rpc("insert_chat", chat);
export const update = (chat: Chat) => supabase.rpc("update_chat", chat);
