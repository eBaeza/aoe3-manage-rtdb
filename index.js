import { config as dotEnvConfig } from "dotenv-flow";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, connectDatabaseEmulator } from "firebase/database";

dotEnvConfig()

const databaseURL = process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:9000/?ns=aoe3-companion'
    : process.env.FB_DATABASE_URL

const app = initializeApp({
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID,
});
const auth = getAuth()
const db = getDatabase(app);

if (process.env.NODE_ENV === 'development') {
    connectDatabaseEmulator(db, "localhost", 9000);
}

const langs = ['es', 'en', 'pt_br', 'zh', 'fr']

async function uploadLanguages() {
    try {
        await signInWithEmailAndPassword(auth, process.env.AUTH_EMAIL, process.env.AUTH_PASS)

        for (let lang of langs) {
            console.log('===========================')
            console.log(`1. Loading lang ${lang} json`)
            const data = await import(`./data/localization/stringtabley_${lang}.json`, { assert: { type: "json" } })
            console.log(`2. Indexing lang ${lang} json`)
            const dataIndexed = data.default.stringtable.language.string.reduce((obj, { ['#text']: text, ...item }) => {
                obj[item?.['@_locid']] = { ...item, text, active: 0 }
                return obj
            }, {})
            const dbRef = ref(db, `localization/${lang}`)
            console.log(`Saving new values lang ${lang} to DB`)
            await set(dbRef, dataIndexed)
            console.log(`Saved lang ${lang} to DB`)
            console.log('===========================\n\n')
        }
    } catch (error) {
        console.error(err)
    }
}

uploadLanguages().then(() => {
    console.log('Languages upload ended')
    process.exit()
})
