import React from "react";
import DataStore from "./DataStore";

export const UserContext = React.createContext({
    lang: "lv",
    langs: [{ code: "lv", title: "Latvian" }, { code: "en", title: "English" }, { code: "ru", title: "Russian" }],
    switchLang: (lng) => { console.log("SWITCH_LANG: " + lng); },
});

export const MetaContext = React.createContext({
    available: false,
});

export const ModelContext = React.createContext({
    available: true,
    store: new DataStore(),
});