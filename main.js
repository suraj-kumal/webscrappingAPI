// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const { scrapeDaraz } = require("./daraz");
// const { scrapeHukut } = require("./hukut");
// const { scrapeNeoStore } = require("./neostore");

// async function scrapeMultipleSites(keyword) {
//   const startTime = performance.now();

//   console.log(`Starting multi-site scraping for "${keyword}"...`);
//   console.log("---------------------------------------------");

//   const browser = await puppeteer.launch({
//     headless: true,
//     defaultViewport: null,
//     args: ["--window-size=800,600"],
//   });

//   try {
//     const [darazProducts, hukutProducts, neoStoreProducts] = await Promise.all([
//       scrapeDaraz(browser, keyword).catch((err) => {
//         console.error("Error in Daraz scraper:", err);
//         return [];
//       }),
//       scrapeHukut(browser, keyword).catch((err) => {
//         console.error("Error in Hukut scraper:", err);
//         return [];
//       }),
//       scrapeNeoStore(browser, keyword).catch((err) => {
//         console.error("Error in NeoStore scraper:", err);
//         return [];
//       }),
//     ]);

//     const allProducts = [
//       ...darazProducts,
//       ...hukutProducts,
//       ...neoStoreProducts,
//     ];

//     const organizedResults = {
//       all: allProducts,
//       bySource: {
//         Daraz: darazProducts,
//         Hukut: hukutProducts,
//         NeoStore: neoStoreProducts,
//       },
//       stats: {
//         totalCount: allProducts.length,
//         sourceCounts: {
//           Daraz: darazProducts.length,
//           Hukut: hukutProducts.length,
//           NeoStore: neoStoreProducts.length,
//         },
//       },
//     };
//     console.log("---------------------------------------------");
//     console.log("Scraping completed. Results summary:");
//     console.log(`- Total products: ${allProducts.length}`);
//     console.log(`- Daraz: ${darazProducts.length} products`);
//     console.log(`- Hukut: ${hukutProducts.length} products`);
//     console.log(`- NeoStore: ${neoStoreProducts.length} products`);

//     return organizedResults;
//   } catch (err) {
//     console.error("Error in multi-site scraping:", err);
//   } finally {
//     console.log("---------------------------------------------");
//     console.log("Closing browser...");
//     await browser.close();

//     const endTime = performance.now();
//     const timeTaken = (endTime - startTime) / 1000;
//     console.log(`Total time taken: ${timeTaken.toFixed(2)} seconds`);
//   }
// }

// if (require.main === module) {
//   const keyword = process.argv[2] || "laptop";
//   scrapeMultipleSites(keyword)
//     .then(() => {
//       console.log("Multi-site scraping completed successfully.");
//       process.exit(0);
//     })
//     .catch((err) => {
//       console.error("Fatal error in multi-site scraping:", err);
//       process.exit(1);
//     });
// }

// module.exports = { scrapeMultipleSites };
const puppeteer = require("puppeteer");
const fs = require("fs");
const { scrapeDaraz } = require("./daraz");
const { scrapeHukut } = require("./hukut");
const { scrapeNeoStore } = require("./neostore");

function formatMemoryUsage(data) {
  return `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
}

function logMemoryUsage(label = "Current memory usage") {
  const memoryData = process.memoryUsage();

  console.log("---------------------------------------------");
  console.log(`${label}:`);
  console.log(
    `- RSS: ${formatMemoryUsage(memoryData.rss)} (Total memory allocated)`
  );
  console.log(
    `- Heap Used: ${formatMemoryUsage(memoryData.heapUsed)} (Heap memory used)`
  );
  console.log(
    `- Heap Total: ${formatMemoryUsage(memoryData.heapTotal)} (Total heap size)`
  );
  console.log(
    `- External: ${formatMemoryUsage(memoryData.external)} (External memory)`
  );
  console.log("---------------------------------------------");

  return memoryData;
}

async function scrapeMultipleSites(keyword) {
  const startTime = performance.now();
  const initialMemory = logMemoryUsage("Initial memory usage");

  console.log(`Starting multi-site scraping for "${keyword}"...`);
  console.log("---------------------------------------------");

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--window-size=800,600"],
  });

  try {
    logMemoryUsage("Memory usage after browser launch");

    const [darazProducts, hukutProducts, neoStoreProducts] = await Promise.all([
      scrapeDaraz(browser, keyword).catch((err) => {
        console.error("Error in Daraz scraper:", err);
        return [];
      }),
      scrapeHukut(browser, keyword).catch((err) => {
        console.error("Error in Hukut scraper:", err);
        return [];
      }),
      scrapeNeoStore(browser, keyword).catch((err) => {
        console.error("Error in NeoStore scraper:", err);
        return [];
      }),
    ]);

    logMemoryUsage("Memory usage after scraping");

    const allProducts = [
      ...darazProducts,
      ...hukutProducts,
      ...neoStoreProducts,
    ];

    const organizedResults = {
      all: allProducts,
      bySource: {
        Daraz: darazProducts,
        Hukut: hukutProducts,
        NeoStore: neoStoreProducts,
      },
      stats: {
        totalCount: allProducts.length,
        sourceCounts: {
          Daraz: darazProducts.length,
          Hukut: hukutProducts.length,
          NeoStore: neoStoreProducts.length,
        },
      },
    };

    console.log("---------------------------------------------");
    console.log("Scraping completed. Results summary:");
    console.log(`- Total products: ${allProducts.length}`);
    console.log(`- Daraz: ${darazProducts.length} products`);
    console.log(`- Hukut: ${hukutProducts.length} products`);
    console.log(`- NeoStore: ${neoStoreProducts.length} products`);

    return organizedResults;
  } catch (err) {
    console.error("Error in multi-site scraping:", err);
  } finally {
    console.log("---------------------------------------------");
    console.log("Closing browser...");
    await browser.close();

    const finalMemory = logMemoryUsage("Final memory usage");

    // Calculate memory differences
    const memoryDifference = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      external: finalMemory.external - initialMemory.external,
    };

    console.log("---------------------------------------------");
    console.log("Memory consumption during scraping:");
    console.log(`- RSS Difference: ${formatMemoryUsage(memoryDifference.rss)}`);
    console.log(
      `- Heap Used Difference: ${formatMemoryUsage(memoryDifference.heapUsed)}`
    );
    console.log(
      `- Heap Total Difference: ${formatMemoryUsage(
        memoryDifference.heapTotal
      )}`
    );
    console.log(
      `- External Difference: ${formatMemoryUsage(memoryDifference.external)}`
    );

    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000;
    console.log("---------------------------------------------");
    console.log(`Total time taken: ${timeTaken.toFixed(2)} seconds`);
  }
}

if (require.main === module) {
  const keyword = process.argv[2] || "laptop";
  scrapeMultipleSites(keyword)
    .then(() => {
      console.log("Multi-site scraping completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal error in multi-site scraping:", err);
      process.exit(1);
    });
}

module.exports = { scrapeMultipleSites };
