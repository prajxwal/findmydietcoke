import { chromium } from "playwright";

export async function checkZepto(lat: number, lng: number): Promise<boolean> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    permissions: ['geolocation'],
    geolocation: { latitude: lat, longitude: lng }
  });
  const page = await context.newPage();

  let found = false;

  try {
    // Navigate to Zepto — geolocation context auto-sets location
    await page.goto("https://www.zepto.com/", { timeout: 30000 });
    await page.waitForTimeout(3000);

    // If "Detect my location" or "Use current location" button appears, click it
    const detectBtn = page.getByText(/detect|current location|use my location/i).first();
    if (await detectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detectBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(3000);
    }

    // If location modal is still open, try clicking "Select Location" then "Detect"
    const locBtn = page.getByText(/Select Location/i).first();
    if (await locBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await locBtn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(2000);

      // Try "Detect my location" inside the modal
      const detectInModal = page.getByText(/detect|current location/i).first();
      if (await detectInModal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await detectInModal.click({ force: true }).catch(() => {});
        await page.waitForTimeout(3000);
      }
    }

    // Inject fetch interceptor + trigger search
    await page.evaluate(() => {
      (window as any).dietCokeFound = false;

      // Intercept fetch
      const originalFetch = window.fetch;
      window.fetch = async (...args: any[]) => {
        const response = await originalFetch(...args);
        try {
          const url = args[0];
          if (typeof url === "string" && (url.includes("search") || url.includes("graphql"))) {
            const clone = response.clone();
            const data = await clone.json();
            const products = data?.data?.products || data?.data?.items || data?.storeProducts || [];
            if (products.some((p: any) => {
              const name = (p.name || p.title || "").toLowerCase();
              return name.includes("diet coke");
            })) {
              (window as any).dietCokeFound = true;
            }
          }
        } catch (e) { }
        return response;
      };

      // Trigger search
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') || document.querySelector('input');
        if (input) {
          (input as HTMLInputElement).focus();
          (input as HTMLInputElement).value = "diet coke";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
          setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 2000);
        }
      }, 1000);
    });

    // Wait for search results
    await page.waitForTimeout(8000);

    // Check intercepted result
    found = await page.evaluate(() => (window as any).dietCokeFound);

    // Fallback: check page text
    if (!found) {
      const text = await page.evaluate(() => document.body.innerText).catch(() => "");
      if (text.toLowerCase().includes("diet coke")) found = true;
    }

  } catch (error) {
    console.error("Error scraping Zepto:", error);
  } finally {
    await browser.close();
  }

  return found;
}
