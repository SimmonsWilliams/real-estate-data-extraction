const cards = [
  ...document.querySelectorAll('article')
];

const data = cards.map(card => {

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

  // STUDIO FIX
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

console.log(data);

copy(data);