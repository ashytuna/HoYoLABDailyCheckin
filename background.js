'use strict';

const TIMEOUT = 1852;

chrome.runtime.onStartup.addListener(() => {
    setTimeout(onload, TIMEOUT);
});

const onload = async () => {
    try {
        let checkinHonkai = await fetch(
            "https://sg-public-api.hoyolab.com/event/mani/sign",
            {
                method: "POST",
                body: JSON.stringify({ act_id: "e202110291205111" })
            });
        console.log(await checkinHonkai.text());
    }
    catch (e) {
        console.error('Check-in Honkai error: ' + e.message);
        setTimeout(onload, TIMEOUT);
    }

    try {
        let checkinGenshin = await fetch(
            "https://sg-hk4e-api.hoyolab.com/event/sol/sign",
            {
                method: "POST",
                body: JSON.stringify({ act_id: "e202102251931481" })
            });
        console.log(await checkinGenshin.text());

    }
    catch (e) {
        console.error('Check-in Genshin error: ' + e.message);
        setTimeout(onload, TIMEOUT);
    }

    try {
        let checkinHSR = await fetch(
            "https://sg-public-api.hoyolab.com/event/luna/os/sign",
            {
                method: "POST",
                body: JSON.stringify({ act_id: "e202303301540311" })
            });
        console.log(await checkinHSR.text());
    }
    catch (e) {
        console.error('Check-in HSR error: ' + e.message);
        setTimeout(onload, TIMEOUT);
    }
};
