const puppeteer = require("puppeteer");

async function scrapeHukut(browser, keyword) {
  console.log(`Starting Hukut scraping for "${keyword}"...`);
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
    const baseUrl = "https://hukut.com";
    await page.goto(`${baseUrl}/search/${encodeURIComponent(keyword)}`, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector(".flex-1.flex.flex-col.h-full", {
      timeout: 10000,
    });
    const products = await page.evaluate((baseUrl) => {
      const productList = [];
      const productElements = document.querySelectorAll(
        ".flex-1.flex.flex-col.h-full"
      );

      productElements.forEach((productElement) => {
        const titleElement = productElement.querySelector("h4 a p");

        const priceElement = productElement.querySelector(
          "div[class*='font-semibold'][class*='text-tiny'][class*='my-12']"
        );

        const imageElement = productElement.querySelector("img");
        const linkElement = productElement.querySelector("a");

        const title = titleElement ? titleElement.textContent.trim() : null;

        // Extract price and clean it by removing rupee symbol and commas
        let price = priceElement
          ? priceElement.textContent.trim()
          : "Price not available";

        if (price !== "Price not available") {
          // Remove "रु" and commas, then trim whitespace
          price = price.replace(/रु\s*|,/g, "").trim();
        }

        let img = "Image not available";
        if (imageElement) {
          const srcAttribute = imageElement.getAttribute("src");
          if (srcAttribute) {
            if (srcAttribute.startsWith("/")) {
              img = `${baseUrl}${srcAttribute}`;
            } else {
              img = srcAttribute;
            }
          }
        }

        const link = linkElement ? linkElement.href : null;

        if (title) {
          productList.push({
            source: "Hukut",
            title,
            price,
            img,
            link,
          });
        }
      });

      return productList;
    }, baseUrl);
    console.log(`Completed Hukut scraping. Found ${products.length} products.`);
    return products;
  } catch (err) {
    console.error("Error in Hukut scraping:", err);
    return [];
  } finally {
    await page.close();
  }
}

module.exports = { scrapeHukut };
