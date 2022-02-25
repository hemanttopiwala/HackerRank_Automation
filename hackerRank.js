// node hackerRank.js --url="https://www.hackerrank.com" --config="config.json"
let minimist=require('minimist');
let fs=require('fs');
let puppeteer=require('puppeteer');

let args=minimist(process.argv);

console.log(args.url);
console.log(args.config);

let jsonfilestr=fs.readFileSync(args.config,'utf-8');
let configjso=JSON.parse(jsonfilestr);


async function run(){

    let browser=await puppeteer.launch({
        headless:false,
        args:[
            '--start-maximized'
        ],
        defaultViewport:null
    });

    //get a tab
    let page=await browser.newPage();
    // go to url
    await page.goto(args.url);
    // login click
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    //login page
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    //enter the user name from keyboard
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']",configjso.username,{delay:30});

    //Enter the password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']",configjso.password,{delay:30});

    //click on the login button
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    //click on the contest
    await page.waitForSelector("a[href='/contests']");
    await page.click("a[href='/contests']");

    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    // find pages
    await page.waitForSelector("a[data-attr1='Last']");

    let numPages=await page.$eval("a[data-attr1='Last']",function(lastTag){
        let numPages=lastTag.getAttribute("data-page");

        return parseInt(numPages);


    });
    console.log(numPages);

    // move all the pages
    for(let i=0;i<numPages;i++){
        
        await handlePage(browser,page);
    }
    //move through all pages
}


async function handleContest(npage,fullurl,modaraters){

        await npage.bringToFront();
            
        await npage.goto(fullurl);

        await npage.waitFor(3000);
            
        await npage.waitForSelector("li[data-tab='moderators']");
        await npage.click("li[data-tab='moderators']");

            
            
        await npage.waitFor(5000);


        await npage.waitForSelector("input#moderator");
        await npage.type('input#moderator',configjso.modaraters,{delay:50});

        await npage.keyboard.press("Enter");



}


async function handlePage(browser,page){

    await page.waitForSelector("a.backbone.block-center");
    let curls=await page.$$eval("a.backbone.block-center",function(atags){
        let urls=[];

        for(let i=0;i<atags.length;i++){
            
            let url=atags[i].getAttribute('href');

            urls.push(url);
        }

        return urls;
    });
    console.log(curls);

    for(let i=0;i<curls.length;i++){
        await handleContest(browser,page,curls[i]);
    }



    await page.waitFor(1500);
    await page.waitForSelector("a[data-attr1='Right']");
    await page.click("a[data-attr1='Right']");
}


async function handleContest(browser,page,curl){
    let npage=await browser.newPage();
    await npage.goto(args.url+curl);

    await npage.waitFor(2000);

    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");

    console.log(configjso.modaraters);
        
    await npage.waitFor(5000);

    for(let i=0;i<configjso.modaraters.length;i++){
        let moderators=configjso.modaraters[i];
        console.log(moderators);
        await npage.waitForSelector("input#moderator");
        await npage.type('input#moderator',moderators,{delay:50});

        await npage.keyboard.press("Enter");

    }
    


    await npage.close();
    await npage.waitFor(2000);
}

run();
