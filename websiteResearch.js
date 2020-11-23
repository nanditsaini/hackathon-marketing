const puppeteer = require('puppeteer');
const { addExtra } = require('puppeteer-extra')
const puppeteerPrefs = require('puppeteer-extra-plugin-user-preferences');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const screenshot = require('screenshot-desktop');
const path = require('path');
const fs = require('fs');
const websitesList = './websitesList';

const ppt1 = addExtra(puppeteer);

ppt1.use(StealthPlugin());
ppt1.use(puppeteerPrefs({
    userPrefs: {
        devtools: {
            preferences: {
                // // currentDockState: '"bottom"',
                // "Inspector.drawerSplitViewState": "{\"horizontal\":{\"size\":0,\"showMode\":\"OnlyMain\"}}",
                // "InspectorView.splitViewState": "{\"horizontal\":{\"size\":566}}",
                // "panel-selectedTab": '"resources"',
                // // "resourcesLastSelectedElementPath": "[\"category://Fonts\"]",
                // "resourcesLastSelectedElementPath": "[\"category://Cache Storage\"]",
                // "resourcesPanelSplitViewState": "{\"vertical\":{\"size\":534}}",
                // // "resourcesfontExpanded": "true",


                "Inspector.drawerSplitViewState": "{\"horizontal\":{\"size\":0,\"showMode\":\"OnlyMain\"}}",
                "InspectorView.splitViewState": "{\"horizontal\":{\"size\":411}}",
                "closeableTabs": "{\"security\":true}",
                "currentDockState": "\"bottom\"",
                "inspectorVersion": "30",
                "networkPanelSidebarState": "{\"vertical\":{\"size\":0,\"showMode\":\"OnlyMain\"}}",
                "networkPanelSplitViewState": "{\"vertical\":{\"size\":535}}",
                "networkPanelSplitViewWaterfall": "{\"vertical\":{\"size\":0}}",
                "networkResourceTypeFilters": "{\"Fonts\":true}",
                "panel-selectedTab": "\"network\"",
            },
        },
    },
}))


const OUTPUT_FOLDER = 'web_research';
const IMAGES_FOLDER_NAME = 'images';
const WEBSITE_TRAFIC_IMAGE_NAME = 'websiteTrafic.jpg';
const FONT_PREVIEW_NAME = 'fontsList.jpg';

const outputPath = process.argv[2]
let websites = fs.readFileSync(websitesList, 'utf-8').split('\n');
const startFrom = process.argv[3] === '--start-from' ? (parseInt(process.argv[4], 10) - 1) : 0;
const outputDir = path.join(outputPath, OUTPUT_FOLDER);

async function setRequestInterceptionToDownloadWebsiteFonts(page, website, index) {
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.setRequestInterception', {
        patterns: [
            {
                urlPattern: `*${website}*`,
                resourceType: 'Font',
                interceptionStage: 'HeadersReceived',
            },
            /* need to find a way to intercept data URI of fonts */
            // {
            //     urlPattern: `*data:*`,
            //     resourceType: 'Font',
            //     interceptionStage: 'HeadersReceived',
            // }
        ]
    });

    // await new Promise((resolve) => setTimeout(resolve, 3000));

    client.on('Network.requestIntercepted', async ({ interceptionId, request, }) => {
        console.log('intercepted request', website, request.url, interceptionId);
        const response = await client.send('Network.getResponseBodyForInterception', {
            interceptionId
        });
        // console.log(`response ${website}`, response.body);

        const urlParts = request.url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const websiteFolder = path.join(outputDir, website);

        if (!fs.existsSync(websiteFolder)) {
            fs.mkdirSync(websiteFolder);
        }

        fs.writeFileSync(path.join(websiteFolder, fileName), Buffer.from(response.body, 'base64'));

        await client.send('Network.continueInterceptedRequest', {
            interceptionId,
        });
    });
}

async function takeWebsiteTrafficScreenshot(page, website, index) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const similarWebUrl = `https://www.similarweb.com`;
        
        // await page.goto(similarWebUrl);

        // const searchInputSelector = '#js-swSearch-input';
        // await page.waitForSelector(searchInputSelector, { timeout: 0 });
        // // await page.waitForNavigation();
        // await page.type(searchInputSelector, website, { delay: 200 });
        // await page.keyboard.press('Enter', { delay: 100 });

        const websiteUrl = website.split('/')[0];
        await page.goto(`${similarWebUrl}/website/${websiteUrl}`);

        // This delay is added so that the engagement section animation is complete
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const engagementSectionSelector = '.js-sectionEngagement';
        await page.waitForSelector(engagementSectionSelector, { timeout: 10000 });
        const engageMentSection = await page.$(engagementSectionSelector);

        const pathPrefix = path.join(outputDir, `${website}`, IMAGES_FOLDER_NAME);
        if (!fs.existsSync(pathPrefix)) {
            fs.mkdirSync(pathPrefix, { recursive: true });
        }

        if (engageMentSection) {
            await engageMentSection.screenshot({ path: path.join(pathPrefix, WEBSITE_TRAFIC_IMAGE_NAME), type: 'jpeg' });
        } else {
            console.log('Could not find engagement section', website);
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
    } catch (error) {
        console.log('Could not take website traffic', website, typeof error);
    }
}

async function takeTextPreviewScreenshot(page, website, index) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pathPrefix = path.join(outputDir, `${website}`, IMAGES_FOLDER_NAME);
    if (!fs.existsSync(pathPrefix)) {
        fs.mkdirSync(pathPrefix, { recursive: true });
    }

    await screenshot({ filename: path.join(pathPrefix, FONT_PREVIEW_NAME) });
    await new Promise((resolve) => setTimeout(resolve, 3000));
}

(async () => {
    try {
        const browser = await ppt1.launch({
            headless: false,
            devtools: true,
            args: [
                '--start-fullscreen', // you can also use '--start-fullscreen',
                // '--content-shell-hide-toolbar',
            ],
            defaultViewport: null,
            // slowMo: 1000,
        });
        const [page] = await browser.pages();

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        websites = websites.slice(startFrom);
        // console.log('websites', websites);
        for (let index = 0; index < websites.length; index++) {
            const website = websites[index];

            const websiteDir = path.join(outputDir, website)
            if (!fs.existsSync(websiteDir)) {
                fs.mkdirSync(websiteDir, { recursive: true });
                fs.mkdirSync(path.join(websiteDir, IMAGES_FOLDER_NAME), { recursive: true });
            }

            // await setRequestInterceptionToDownloadWebsiteFonts(page, website, index);

            try {
                const url = `https://${website}`;
                await page.goto(url, { timeout: 60000 });
            } catch (error) {

                try {
                    const url = `http://${website}`;
                    await page.goto(url, { timeout: 60000 });
                } catch (error) {
                    continue;
                }
            }

            await page.bringToFront();
            await takeTextPreviewScreenshot(page, website, index);
            await takeWebsiteTrafficScreenshot(page, website, index);
        }

        await browser.close();
    } catch (error) {
        console.log(error);
    }
})();