import { chromium } from "playwright";

export async function checkZepto(userLocation: string): Promise<boolean> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();

  let found = false;

  try {
    await page.goto("https://www.zepto.com/", { timeout: 30000 });

    // Handle Location (Playwright setup)
    const locBtn = page.getByText(/Select Location/i).first();
    if (await locBtn.isVisible().catch(() => false)) {
      await locBtn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const inputLoc = page.locator('input[type="text"]').first();
      await inputLoc.fill(userLocation).catch(() => {});
      await page.waitForTimeout(3000);
      
      // Use visual coordinate click to reliably select the first suggestion and bypass React event blockers
      const box = await inputLoc.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height + 50);
      }
      await page.waitForTimeout(3000);
    }

    // INJECT USER SCRIPT (text.js)
    await page.evaluate(() => {
        // @ts-ignore
        window.dietCokeFound = false;

        // -------- INTERCEPT FETCH --------
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            try {
                const url = args[0];
                if (typeof url === "string" && (url.includes("search") || url.includes("graphql"))) {
                    const clone = response.clone();
                    const data = await clone.json();
                    processData(data);
                }
            } catch (e) { }
            return response;
        };

        // -------- PROCESS DATA --------
        function processData(data: any) {
            const products = data?.data?.products || data?.data?.items || data?.storeProducts || [];
            if (products.some((p: any) => {
                const name = (p.name || p.title || "").toLowerCase();
                return name.includes("diet coke") || name.includes("coke zero") || name.includes("coca-cola zero");
            })) {
                // @ts-ignore
                window.dietCokeFound = true;
            }
        }

        // -------- TRIGGER SEARCH --------
        setTimeout(() => {
            const input = document.querySelector('input[type="text"]') || document.querySelector('input');
            if (input) {
                // @ts-ignore
                input.focus();
                // @ts-ignore
                input.value = "coca cola zero";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
                
                // -------- SCROLL TRIGGER (IMPORTANT) --------
                setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 2000);
            }
        }, 1000);
    });

    // Wait for the script to execute DOM clicks and scroll (up to 8 seconds delay)
    await page.waitForTimeout(8000);
    
    // Check the variable from window
    found = await page.evaluate(() => (window as any).dietCokeFound);
    
    // Fallback: visual check
    if (!found) {
        const text = await page.evaluate(() => document.body.innerText).catch(() => "");
        if (text.toLowerCase().includes("coca-cola zero") || text.toLowerCase().includes("coke zero")) found = true;
    }

  } catch (error) {
    console.error("Error scraping Zepto:", error);
  } finally {
    await browser.close();
  }

  return found;
}
