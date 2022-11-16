import fs from 'fs'
import whiteList from "./dbids/homePage.json" assert { type: 'json' };
import deckBuilderList from "./dbids/deckBuilder.json" assert { type: 'json' };
import unitsPage from "./dbids/unitsPage.json" assert { type: 'json' };
const langs = ['es', 'en', 'pt_br', 'zh', 'fr']

async function generateSeed() {
    try {
        let seedData = { localization: {} }
        for (let lang of langs) {
            console.log('===========================')
            console.log(`1. Loading lang ${lang} json`)
            const data = await import(`./data/localization/stringtabley_${lang}.json`, { assert: { type: "json" } })

            console.log(`2. Indexing lang ${lang} json`)
            let dataIndexed = data.default.stringtable.language.string.reduce((obj, { ['#text']: text, ...item }) => {
                obj[item?.['@_locid']] = {
                    ...item,
                    text,
                    homePage: 0,
                    deckBuilder: 0,
                    unitsPage: 0,
                }
                return obj
            }, {})

            whiteList.forEach(val => {
                dataIndexed[val] && (dataIndexed[val].homePage = 1)
            })

            deckBuilderList.forEach(val => {
                dataIndexed[val] && (dataIndexed[val].deckBuilder = 1)
            })

            unitsPage.forEach(val => {
                dataIndexed[val] && (dataIndexed[val].unitsPage = 1)
            })

            seedData.localization[lang] = dataIndexed
        }

        fs.writeFile('./export/database_export/aoe3-companion.json', JSON.stringify(seedData), (err) => {
            if (err) throw err;
            console.log('Data written to file /export/database_export/aoe3-companion.json');
        });
    } catch (error) {
        console.error(error)
    }
}

generateSeed().then(() => {
    console.log('generated')
})


// JSON.stringify(
//     [...new Set(
//         Object.keys(window.translationsIds)
//     )]
// )