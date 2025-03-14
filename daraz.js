const puppeteer = require("puppeteer");

async function scrapeDaraz(browser, keyword) {
  console.log(`Starting Daraz scraping for "${keyword}"...`);
  const page = await browser.newPage();
  // page.setRequestInterception(true);
  // page.on("request", (request) => {
  //   if (
  //     request.resourceType() === "image" ||
  //     request.resourceType() === "font" ||
  //     request.resourceType() === "media"
  //   ) {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  try {
    await page.goto(
      `https://www.daraz.com.np/catalog/?q=${encodeURIComponent(keyword)}`,
      {
        waitUntil: "networkidle2",
      }
    );

    await page.waitForSelector("div.RfADt a");

    const products = await page.evaluate(() => {
      let items = [];

      const prices = Array.from(document.getElementsByClassName("ooOxS")).map(
        (priceElement) => {
          let priceText = priceElement.innerText.trim();
          return priceText.replace("Rs.", "").replace(/,/g, "").trim();
        }
      );

      const images = Array.from(document.getElementsByClassName("jBwCF")).map(
        (imgElement) => {
          let img = imgElement.querySelector("img");
          return img ? img.src : "N/A";
        }
      );

      const productElements = document.querySelectorAll("div.RfADt");
      productElements.forEach((product, index) => {
        const titleElement = product.querySelector("a");
        const title = titleElement ? titleElement.innerText.trim() : "N/A";
        const link = titleElement
          ? "https:" + titleElement.getAttribute("href")
          : "N/A";
        const price = prices[index] || "N/A";
        const img = images[index] || "N/A";
        items.push({
          source: "Daraz",
          title,
          price,
          link,
          img,
        });
      });

      return items;
    });

    console.log(`Completed Daraz scraping. Found ${products.length} products.`);
    return products;
  } catch (err) {
    console.error("Error in Daraz scraping:", err);
    return [];
  } finally {
    await page.close();
  }
}

module.exports = { scrapeDaraz };
