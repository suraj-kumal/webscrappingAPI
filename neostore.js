const puppeteer = require("puppeteer");

async function scrapeNeoStore(browser, keyword) {
  console.log(`Starting NeoStore scraping for "${keyword}"...`);
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
      `https://www.neostore.com.np/products/search?query=${encodeURIComponent(
        keyword
      )}`,
      {
        waitUntil: "networkidle2",
      }
    );

    await page.waitForSelector(".product-item-box", { timeout: 10000 });

    const products = await page.evaluate(() => {
      const productList = [];
      const productElements = document.querySelectorAll(".product-item-box");

      productElements.forEach((productElement) => {
        const titleElement = productElement.querySelector(".product-title a");
        const priceElement = productElement.querySelector(".price.price-first");
        const imageElement = productElement.querySelector(
          ".product-thumbnail img"
        );
        const linkElement = productElement.querySelector(".product-thumbnail");

        const title = titleElement ? titleElement.textContent.trim() : null;

        // Extract price and clean it by removing "Rs." and commas
        let price = priceElement ? priceElement.textContent.trim() : null;
        if (price) {
          // Remove "Rs." and commas, then convert to number
          price = price.replace(/Rs\.|,/g, "").trim();
        }

        const img = imageElement ? imageElement.getAttribute("src") : null;
        const link = linkElement ? linkElement.getAttribute("href") : null;

        if (title) {
          productList.push({
            source: "NeoStore",
            title,
            price,
            img,
            link,
          });
        }
      });

      return productList;
    });

    console.log(
      `Completed NeoStore scraping. Found ${products.length} products.`
    );
    return products;
  } catch (err) {
    console.error("Error in NeoStore scraping:", err);
    return [];
  } finally {
    await page.close();
  }
}

module.exports = { scrapeNeoStore };
