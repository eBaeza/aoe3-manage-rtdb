import fs from 'fs';
import homePageList from "./dbids/homePage.json" with {type: 'json'};
import deckBuilderList from "./dbids/deckBuilder.json" with {type: 'json'};
import unitsPageList from "./dbids/unitsPage.json" with {type: 'json'};
import nativesPageList from "./dbids/nativesPage.json" with {type: 'json'};
import dataAOW from './data/mods/aow/english/stringmods.json' with {type: 'json'};

const langs = ['es', 'en', 'pt-BR', 'zh-TW', 'zh-CN', 'fr', 'de', 'ja', 'tr']
const langsMap = {
    'es': 'spanish',
    'en': 'english',
    'pt-BR': 'portuguesebrazil',
    'zh-TW': 'traditionalchinese',
    'zh-CN': 'simplifiedchinese',
    'fr': 'french',
    'de': 'german',
    'ja': 'japanese',
    'tr': 'turkish'
}

async function generateSeed() {
    try {
        const dataAOWIndexed = dataAOW.stringmods.StringTable.Language.string.reduce((obj, { ['#text']: text, ...item }) => {
            obj[item?.['@_locid']] = text

            if(item?.['@symbol'])
                obj[item?.['@symbol']?.toLowerCase()] = text

            return obj
        }, {})


        fs.mkdir(`./exported/aow`, { recursive: true }, (err) => {
            if (err) throw err;
        });

        fs.writeFile(`./exported/aow/aow.json`, JSON.stringify(dataAOWIndexed), (err) => {
            if (err) throw err;
            console.log(`Data written to file ./exported/aow/aow.json`);
        });

        for (let lang of langs) {
            console.log('===========================')
            console.log(`1. Loading lang ${lang} json`)
            const data = await import(`./data/localization/${langsMap[lang]}/stringtabley.json`, { with: { type: "json" } })

            console.log(`2. Indexing lang ${lang} json`)
            let dataIndexed = data.default.language.string.reduce((obj, { ['#text']: text, ...item }) => {
                obj[item?.['@_locid']] = {
                    symbol: item?.['@symbol']?.toLowerCase(),
                    text
                }
                return obj
            }, {})

            const dataReplaces = await import(`./data/datapatch/${langsMap[lang]}/stringmods.json`, { with: { type: "json" } })
            dataIndexed = dataReplaces.default.stringmods.stringtable.language.string.reduce((obj, { ['#text']: text, ...item }) => {
                obj[item?.['@_locid']] = {
                    ...item,
                    text
                }
                return obj
            }, dataIndexed)


            let homePage = {}
            let deckBuilder = {}
            let unitsPage = {}
            let nativesPage = {}

            homePageList.forEach(val => {
                if (dataIndexed[val]) {
                    homePage[val] = dataIndexed[val].text
                    if (dataIndexed[val].symbol) {
                        homePage[dataIndexed[val].symbol] = dataIndexed[val].text
                    }
                }
            })

            deckBuilderList.forEach(val => {
                if (dataIndexed[val]) {
                    deckBuilder[val] = dataIndexed[val].text
                    if (dataIndexed[val].symbol) {
                        deckBuilder[dataIndexed[val].symbol] = dataIndexed[val].text
                    }
                }
            })

            unitsPageList.forEach(val => {
                if (dataIndexed[val]) {
                    unitsPage[val] = dataIndexed[val].text
                    if (dataIndexed[val].symbol) {
                        unitsPage[dataIndexed[val].symbol] = dataIndexed[val].text
                    }
                }
            })

            nativesPageList.forEach(val => {
                if (dataIndexed[val]) {
                    nativesPage[val] = dataIndexed[val].text
                    if (dataIndexed[val].symbol) {
                        nativesPage[dataIndexed[val].symbol] = dataIndexed[val].text
                    }
                }
            })

            fs.mkdir(`./exported/${lang}`, { recursive: true }, (err) => {
                if (err) throw err;
            });

            fs.writeFile(`./exported/${lang}/homePage.json`, JSON.stringify(homePage), (err) => {
                if (err) throw err;
                console.log(`Data written to file ./exported/${lang}/homePage.json`);
            });

            fs.writeFile(`./exported/${lang}/deckBuilder.json`, JSON.stringify(deckBuilder), (err) => {
                if (err) throw err;
                console.log(`Data written to file ./exported/${lang}/deckBuilder.json`);
            });

            fs.writeFile(`./exported/${lang}/unitsPage.json`, JSON.stringify(unitsPage), (err) => {
                if (err) throw err;
                console.log(`Data written to file ./exported/${lang}/unitsPage.json`);
            });

            fs.writeFile(`./exported/${lang}/nativesPage.json`, JSON.stringify(nativesPage), (err) => {
                if (err) throw err;
                console.log(`Data written to file ./exported/${lang}/nativesPage.json`);
            });
        }
    } catch (error) {
        console.error(error)
    }
}

generateSeed().then(() => {
    console.log('generated')
})


// JSON.stringify(
//     [...new Set([
//         ...Object.keys(window.translationsIds)
//     ])]
// )