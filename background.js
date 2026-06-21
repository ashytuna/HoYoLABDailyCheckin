'use strict';

const TIMEOUT = 1852;
const ALARM = "hoyolab-daily";
const MAX_RETRIES = 3;

const GAMES = [
    {
        name: "Honkai Impact 3",
        url: "https://sg-public-api.hoyolab.com/event/mani/sign",
        actId: "e202110291205111"
    },
    {
        name: "Genshin Impact",
        url: "https://sg-hk4e-api.hoyolab.com/event/sol/sign",
        actId: "e202102251931481"
    },
    {
        name: "Honkai: Star Rail",
        url: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
        actId: "e202303301540311"
    },
    {
        name: "Zenless Zone Zero",
        url: "https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign",
        actId: "e202406031448091",
        customHeaders: {
            'x-rpc-signgame': 'zzz'
        }
    }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Checks in a single game, retrying only that game on network errors.
// Returns true once a response is received (already-signed counts as success).
const checkIn = async (game) => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(game.url, {
                method: "POST",
                body: JSON.stringify({ act_id: game.actId }),
                headers: {
                    "content-type": "application/json",
                    ...game.customHeaders
                }
            });
            console.log(`[HoYoLAB] ${game.name}:`, await response.text());
            return true;
        } catch (e) {
            console.error(`[HoYoLAB] ${game.name} error (attempt ${attempt}/${MAX_RETRIES}): ${e.message}`);
            if (attempt < MAX_RETRIES) await sleep(TIMEOUT);
        }
    }
    return false;
};

const todayStr = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

const alreadyDoneToday = async () => {
    const { lastRunDate } = await chrome.storage.local.get({ lastRunDate: "" });
    return lastRunDate === todayStr();
};

const run = async () => {
    if (await alreadyDoneToday()) return;

    let allOk = true;
    for (const game of GAMES) {
        if (!(await checkIn(game))) allOk = false;
    }
    // Only mark the day done if every game was reached, so a failed run retries.
    if (allOk) await chrome.storage.local.set({ lastRunDate: todayStr() });
};

chrome.runtime.onStartup.addListener(() => {
    setTimeout(run, TIMEOUT);
});

chrome.runtime.onInstalled.addListener(() => {
    // Re-arm in case the browser stays open all day across midnight.
    chrome.alarms.create(ALARM, { periodInMinutes: 360 });
    setTimeout(run, TIMEOUT);
});

chrome.alarms.onAlarm.addListener((a) => {
    if (a.name === ALARM) run();
});
