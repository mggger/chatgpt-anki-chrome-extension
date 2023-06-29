chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-to-anki",
        title: "Create Anki card",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(handleContextMenu);

function handleContextMenu(info) {
    if (info.menuItemId === "add-to-anki") {
        const text = "请将下列描述提取成anki卡片的形式, 描述: " + info.selectionText + "\n并且以[{\"front\": \"xxx\", \"back\": \"xxx\"}]格式返回";
        getGPT3Result(text).then((result) => {
            saveAnki(result);
        });
    }
}

async function getGPT3Result(text) {
    const config = await getAnkiConfig();
    const GPT_API_KEY = config.openAIKey;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GPT_API_KEY,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{content: text, role: "user"}]
        })
    });
    const data = await response.json();
    const ret = data.choices[0].message.content.trim();
    return ret;
}

async function saveAnki(result) {
    const resultArray = JSON.parse(result);

    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);  // Month is zero-indexed
    const day = ('0' + today.getDate()).slice(-2);
    const today_time_str = `${year}-${month}-${day}`;

    const config = await getAnkiConfig();
    const ANKI_DESK_NAME = config.ankiDeskName;
    const ANKI_SERVER_ADDRESS = config.ankiServerAddress;

    const requestData = {
        action: "addNote",
        version: 6,
        params: {
            note: {
                deckName: ANKI_DESK_NAME,
                modelName: "Basic",
                fields: {
                    Front: "",
                    Back: ""
                },
                options: {
                    allowDuplicate: false,
                    duplicateScope: "deck",
                    duplicateScopeOptions: {
                        deckName: "Default",
                        checkChildren: false,
                        checkAllModels: false
                    }
                },
                tags: [today_time_str],
            }
        }
    };

    for (let i = 0; i < resultArray.length; i++) {
        const currentResult = resultArray[i];
        requestData.params.note.fields.Front = currentResult.front;
        requestData.params.note.fields.Back = currentResult.back;

        fetch(ANKI_SERVER_ADDRESS, {
            method: "POST",
            modelName: "Basic",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Note added to Anki!");
                    showNotification("add anki success");
                } else {
                    console.error("Failed to add note to Anki:", response);
                    showNotification("add anki failed");
                }
            })
            .catch((error) => {
                console.error("Failed to add note to Anki:", error);
            });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_ANKI_CONFIG') {
        chrome.storage.local.set({ankiConfig: message.config});
        console.log("set anki config success");
    }
});

function getAnkiConfig() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("ankiConfig", (result) => {
            if (result.ankiConfig) {
                resolve(result.ankiConfig);
            } else {
                resolve({
                    openAIKey: "your_openai_key",
                    ankiDeskName: "your_anki_desk_name",
                    ankiServerAddress: "your_anki_server_address",
                });
            }
        });
    });
}

function showNotification(message) {
    chrome.notifications.create({
        type: "basic",
        title: "Anki Card Created",
        message: message,
        iconUrl: "unload.png",
    });
}
