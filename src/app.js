/*global chrome*/
import React, {useState, useEffect} from 'react';
import {FaEye, FaEyeSlash} from 'react-icons/fa';


const AnkiPage = () => {
    const [openAIKey, setOpenAIKey] = useState('');
    const [showOpenAIKey, setShowOpenAIKey] = useState(false);
    const [ankiServerAddress, setAnkiServerAddress] = useState('');
    const [ankiDeskName, setAnkiDeskName] = useState('');
    const [reload, setReload] = useState(false);  // New state variable


    const handleOpenAIKeyChange = (e) => {
        setOpenAIKey(e.target.value);
    };

    const toggleShowOpenAIKey = () => {
        setShowOpenAIKey((prevState) => !prevState);
    };

    const handleAnkiServerAddressChange = (e) => {
        setAnkiServerAddress(e.target.value);
    };

    const handleAnkiDeskNameChange = (e) => {
        setAnkiDeskName(e.target.value);
    };

    useEffect(() => {
        const config = JSON.parse(localStorage.getItem("ankiConfig"));
        if (config) {
            const {openAIKey, ankiServerAddress, ankiDeskName} = config;
            setOpenAIKey(openAIKey);
            setAnkiServerAddress(ankiServerAddress);
            setAnkiDeskName(ankiDeskName);
        }
    }, [reload]);

    const handleSave = () => {
        const config = {
            openAIKey: openAIKey,
            ankiServerAddress: ankiServerAddress,
            ankiDeskName: ankiDeskName
        };

        localStorage.setItem("ankiConfig", JSON.stringify(config));
        setReload(!reload);  // Toggle the reload state variable to trigger useEffect

        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({type: 'SAVE_ANKI_CONFIG', config: config});
        }

        alert("save success");
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100">

            <h2 className="mb-6 text-3xl font-bold text-center w-full text-gray-700">Configuration</h2>

            <div className="my-6 flex w-full justify-between items-center">
                <div className="w-1/3">
                    <label className="text-xl font-semibold text-gray-700">OpenAI API Key:</label>
                </div>
                <div className="relative w-3/4">
                    <input
                        type={showOpenAIKey ? 'text' : 'password'}
                        placeholder="your OPENAI API KEY"
                        value={openAIKey}
                        onChange={handleOpenAIKeyChange}
                        className="border rounded p-3 w-full text-gray-700"
                    />
                    <button
                        onClick={toggleShowOpenAIKey}
                        className="absolute right-3 top-1 p-2 focus:outline-none"
                    >
                        {showOpenAIKey ? (
                            <FaEyeSlash className="h-6 w-6 text-gray-500"/>
                        ) : (
                            <FaEye className="h-6 w-6 text-gray-500"/>
                        )}
                    </button>
                </div>
            </div>

            <div className="my-6 flex w-full justify-between items-center">
                <div className="w-1/3">
                    <label className="text-xl font-semibold text-gray-700">Anki Server Address:</label>
                </div>
                <input
                    type="text"
                    placeholder="http://localhost:8765"
                    value={ankiServerAddress}
                    onChange={handleAnkiServerAddressChange}
                    className="border rounded p-3 w-3/4 text-gray-700"
                />
            </div>

            <div className="my-6 flex w-full justify-between items-center">
                <div className="w-1/3">
                    <label className="text-xl font-semibold text-gray-700">Anki Desk Name:</label>
                </div>
                <input
                    type="text"
                    placeholder="default"
                    value={ankiDeskName}
                    onChange={handleAnkiDeskNameChange}
                    className="border rounded p-3 w-3/4 text-gray-700"
                />
            </div>

            <button
                onClick={handleSave}
                className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6"
            >
                Save
            </button>
        </div>
    );

};

export default AnkiPage;
