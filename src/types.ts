export type Token = {
    athlete_id: number | any,
    expires_at: number | any,
    refresh_token: string | any,
    access_token: string | any
};

export type Chat = {
    platform: string | any,
    data: Record<any, any>
};