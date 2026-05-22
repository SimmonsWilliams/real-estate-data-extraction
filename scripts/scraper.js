const { chromium } = require('playwright');
const fs = require('fs');

(async () => {

  const browser =
  await chromium.launch({

    headless: false

  });

  const page =
  await browser.newPage({

    viewport: {
      width: 1366,
      height: 768
    }

  });

  const allData = [];

  for(let pageNum = 1; pageNum <= 5; pageNum++) {

    let url =
    'https://www.realtor.com/realestateandhomes-search/San-Francisco_CA/type-condo,multi-family-home,townhome,mfd-mobile-home,single-family-home';

    if(pageNum > 1) {

      url += `/pg-${pageNum}`;

    }

    console.log(`OPENING PAGE ${pageNum}`);

    await page.goto(url, {

      waitUntil: 'domcontentloaded',
      timeout: 60000

    });

    await page.waitForTimeout(5000);

    const pageData =
    await page.evaluate(() => {

      const cards = [

        ...document.querySelectorAll('article')

      ];

      return cards.map(card => {

        const text =
        card.innerText;

        const propertyLink =
        card.querySelector(
          'a[href*="/realestateandhomes-detail/"]'
        )?.href || 'N/A';

        // TITLE
        let title = 'N/A';

        if(propertyLink !== 'N/A') {

          const match =
          propertyLink.match(
            /realestateandhomes-detail\/([^?]+)/
          );

          if(match) {

            title =
            match[1]
            .split('_')[0]
            .replace(/-/g, ' ')
            .replace(/\b\w/g,
              c => c.toUpperCase()
            );

          }

        }

        // PRICE
        const price =
        text.match(/\$[\d,.]+/)?.[0] || 'N/A';

        // BEDS
        let beds =
        text.match(/(\d+)\s*bed/i)?.[1];

        if(!beds && /studio/i.test(text)) {

          beds = 'Studio';

        }

        beds = beds || 'N/A';

        // BATHS
        const bathMatch =
        text.match(
          /(\d+(\.\d+)?)(\+)?\s*(bath|ba)/i
        );

        const baths =
        bathMatch?.[1] || 'N/A';

        // SQFT
        const sqftMatches =
        [...text.matchAll(/([\d,]+)\s*sqft/gi)];

        let sqft = 'N/A';

        if(sqftMatches.length) {

          const filtered =
          sqftMatches.find(x => {

            const val =
            parseInt(
              x[1].replace(/,/g,'')
            );

            return (
              val > 200 &&
              val < 20000
            );

          });

          sqft =
          filtered?.[1] || 'N/A';

        }

        return {

          title,
          price,
          beds,
          baths,
          sqft,
          link: propertyLink

        };

      })

      .filter(x => x.link !== 'N/A');

    });

    console.log(
      `EXTRACTED ${pageData.length} RECORDS`
    );

    allData.push(...pageData);

  }

  // CSV EXPORT
  const csv = [

    'title,price,beds,baths,sqft,link',

    ...allData.map(d =>

      `"${d.title}","${d.price}","${d.beds}","${d.baths}","${d.sqft}","${d.link}"`

    )

  ].join('\n');

  fs.writeFileSync(

    'realtor_data.csv',
    csv

  );

  console.log(
    `TOTAL RECORDS: ${allData.length}`
  );

  console.log(
    'CSV EXPORTED SUCCESSFULLY'
  );

  await browser.close();

})();