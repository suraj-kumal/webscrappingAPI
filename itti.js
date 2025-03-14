const puppeteer = require("puppeteer");

async function scrapeITTI(browser, keyword) {
  console.log(`Starting ITTI scraping for "${keyword}"...`);
  const page = await browser.newPage();
  try {
    console.log("Navigating to ITTI...");
    await page.goto(
      `https://itti.com.np/search/result?q=${encodeURIComponent(
        keyword
      )}&category_type=search`,
      { waitUntil: "networkidle2", timeout: 60000 }
    );

    await page.waitForSelector("div.w-full.mt-1", { timeout: 30000 });
    console.log("Product elements found, scrolling to load all content...");
    await autoScroll(page);

    await page.waitForFunction(
      () => document.querySelectorAll("div.w-full.mt-1").length > 0,
      { timeout: 30000 }
    );

    const products = await page.evaluate(() => {
      const productContainers = document.querySelectorAll("div.w-full.mt-1");
      const results = [];

      productContainers.forEach((container) => {
        const linkElement = container.querySelector("a");
        if (!linkElement) return;

        const link = linkElement.href;
        const title = linkElement
          .querySelector("p.font-medium.text-black.text-base")
          ?.innerText.trim();
        const priceElement = container.querySelector(
          ".flex.font-medium.text-dark-red"
        );
        const price = priceElement ? priceElement.innerText.trim() : "N/A";
        const imageElement = container.querySelector("img");
        const img = imageElement ? imageElement.src : null;

        if (title && link) {
          results.push({
            source: "ITTI",
            title,
            price,
            link,
            img,
          });
        }
      });

      return results;
    });

    console.log(`Completed ITTI scraping. Found ${products.length} products.`);
    return products;
  } catch (err) {
    console.error("Error in ITTI scraping:", err);
    return [];
  } finally {
    await page.close();
  }
}

async function autoScroll(page) {
  console.log("Starting auto-scroll...");
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      let timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  console.log("Auto-scroll complete");
}

module.exports = { scrapeITTI };
