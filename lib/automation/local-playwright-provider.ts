import { chromium, Browser, BrowserContext, Page } from "playwright";
import path from "path";
import fs from "fs/promises";
import {
  BrowserAutomationProvider,
  InspectionResult,
  DetectedFormField,
  VerificationResult,
} from "./types";

export class LocalPlaywrightProvider implements BrowserAutomationProvider {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private sessionId: string = "";
  private screenshotDir: string = "";

  async initSession(sessionId: string, options: { headless?: boolean } = {}): Promise<void> {
    this.sessionId = sessionId;
    this.screenshotDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "screenshots",
      sessionId
    );
    await fs.mkdir(this.screenshotDir, { recursive: true });

    this.browser = await chromium.launch({
      headless: options.headless ?? true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });

    this.page = await this.context.newPage();
  }

  async navigateTo(url: string): Promise<{ finalUrl: string; title: string }> {
    if (!this.page) throw new Error("Browser page not initialized");

    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Short stabilization wait for dynamic client-side hydrated apps
    await this.page.waitForTimeout(2000);

    return {
      finalUrl: this.page.url(),
      title: await this.page.title(),
    };
  }

  async takeScreenshot(name: string): Promise<string | null> {
    if (!this.page) return null;
    try {
      const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${Date.now()}_${sanitized}.png`;
      const fullPath = path.join(this.screenshotDir, filename);
      await this.page.screenshot({ path: fullPath, fullPage: false });
      return `/uploads/screenshots/${this.sessionId}/${filename}`;
    } catch (err) {
      console.warn(`[PlaywrightProvider] Screenshot failed for ${name}:`, err);
      return null;
    }
  }

  async inspectForm(): Promise<InspectionResult> {
    if (!this.page) throw new Error("Browser page not initialized");

    const pageUrl = this.page.url().toLowerCase();
    let platform = "unknown";

    if (pageUrl.includes("greenhouse.io") || pageUrl.includes("gh_jid")) platform = "greenhouse";
    else if (pageUrl.includes("jobs.lever.co")) platform = "lever";
    else if (pageUrl.includes("workable.com")) platform = "workable";
    else if (pageUrl.includes("ashbyhq.com")) platform = "ashby";
    else if (pageUrl.includes("smartrecruiters.com")) platform = "smartrecruiters";
    else if (pageUrl.includes("myworkdayjobs.com")) platform = "workday";

    const fields: DetectedFormField[] = await this.page.evaluate(() => {
      const results: Array<{
        label: string;
        fieldType: "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "file";
        isRequired: boolean;
        placeholder?: string;
        options?: Array<{ label: string; value: string }>;
        detectedMeaning?: string;
        selector: string;
        confidence: number;
      }> = [];

      const inputs = Array.from(document.querySelectorAll("input, textarea, select"));

      for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        
        // Skip hidden, submit, button, reset
        if (el.type === "hidden" || el.type === "submit" || el.type === "button" || el.type === "reset") {
          continue;
        }

        // Determine label text
        let labelText = "";
        if (el.id) {
          const labelEl = document.querySelector(`label[for="${el.id}"]`);
          if (labelEl) labelText = labelEl.textContent || "";
        }
        if (!labelText) {
          const parentLabel = el.closest("label");
          if (parentLabel) labelText = parentLabel.textContent || "";
        }
        if (!labelText && el.getAttribute("aria-label")) {
          labelText = el.getAttribute("aria-label") || "";
        }
        if (!labelText && (el as HTMLInputElement).placeholder) {
          labelText = (el as HTMLInputElement).placeholder;
        }
        if (!labelText && el.name) {
          labelText = el.name;
        }

        labelText = labelText.trim().replace(/\s+/g, " ");

        // Determine if required
        const isRequired =
          el.hasAttribute("required") ||
          el.getAttribute("aria-required") === "true" ||
          labelText.includes("*") ||
          labelText.toLowerCase().includes("(required)") ||
          el.classList.contains("required");

        // Clean label text
        const cleanLabel = labelText.replace(/\*/g, "").replace(/\(required\)/gi, "").trim();

        // Field type
        let fieldType: "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "file" = "text";
        if (el.tagName.toLowerCase() === "textarea") fieldType = "textarea";
        else if (el.tagName.toLowerCase() === "select") fieldType = "select";
        else if (el.type === "email") fieldType = "email";
        else if (el.type === "tel" || el.type === "phone") fieldType = "phone";
        else if (el.type === "file") fieldType = "file";
        else if (el.type === "checkbox") fieldType = "checkbox";
        else if (el.type === "radio") fieldType = "radio";

        // Unique CSS selector
        let selector = "";
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.name) {
          selector = `[name="${el.name}"]`;
        } else {
          selector = `${el.tagName.toLowerCase()}:nth-of-type(${i + 1})`;
        }

        // Semantic field meaning heuristic
        const lower = `${cleanLabel} ${el.name || ""} ${el.id || ""}`.toLowerCase();
        let detectedMeaning = "custom";
        let confidence = 0.8;

        if (lower.includes("first name") || lower.includes("firstname") || lower.includes("given name")) {
          detectedMeaning = "first_name";
          confidence = 0.95;
        } else if (lower.includes("last name") || lower.includes("lastname") || lower.includes("family name") || lower.includes("surname")) {
          detectedMeaning = "last_name";
          confidence = 0.95;
        } else if (lower.includes("full name") || (lower.includes("name") && !lower.includes("company") && !lower.includes("file"))) {
          detectedMeaning = "full_name";
          confidence = 0.9;
        } else if (lower.includes("email") || fieldType === "email") {
          detectedMeaning = "email";
          confidence = 0.99;
        } else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("cell") || fieldType === "phone") {
          detectedMeaning = "phone";
          confidence = 0.95;
        } else if (lower.includes("resume") || lower.includes("cv") || fieldType === "file") {
          detectedMeaning = "resume";
          confidence = 0.95;
        } else if (lower.includes("linkedin")) {
          detectedMeaning = "linkedin";
          confidence = 0.98;
        } else if (lower.includes("github")) {
          detectedMeaning = "github";
          confidence = 0.98;
        } else if (lower.includes("website") || lower.includes("portfolio") || lower.includes("personal url")) {
          detectedMeaning = "website";
          confidence = 0.92;
        } else if (lower.includes("location") || lower.includes("city") || lower.includes("address")) {
          detectedMeaning = "location";
          confidence = 0.9;
        }

        // Options for select
        let options: Array<{ label: string; value: string }> | undefined;
        if (fieldType === "select" && el.tagName.toLowerCase() === "select") {
          const selectEl = el as HTMLSelectElement;
          options = Array.from(selectEl.options).map((opt) => ({
            label: opt.textContent?.trim() || opt.value,
            value: opt.value,
          }));
        }

        results.push({
          label: cleanLabel || el.name || `Field ${i + 1}`,
          fieldType,
          isRequired,
          placeholder: (el as HTMLInputElement).placeholder || undefined,
          options,
          detectedMeaning,
          selector,
          confidence,
        });
      }

      return results;
    });

    const isCaptchaPresent = await this.page.evaluate(() => {
      return Boolean(
        document.querySelector(".g-recaptcha, iframe[src*='recaptcha'], iframe[src*='hcaptcha'], #cf-turnstile")
      );
    });

    return {
      title: await this.page.title(),
      platform,
      fields,
      submitButtonSelector: 'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Apply")',
      isMultiStep: false,
      isCaptchaPresent,
      isLoginRequired: false,
    };
  }

  async fillField(selector: string, value: string): Promise<void> {
    if (!this.page) throw new Error("Browser page not initialized");
    await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    if (!this.page) throw new Error("Browser page not initialized");
    await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
    await this.page.selectOption(selector, value);
  }

  async checkInput(selector: string, checked: boolean): Promise<void> {
    if (!this.page) throw new Error("Browser page not initialized");
    await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
    await this.page.setChecked(selector, checked);
  }

  async uploadFile(selector: string, absoluteFilePath: string): Promise<void> {
    if (!this.page) throw new Error("Browser page not initialized");
    const input = await this.page.waitForSelector(selector, { timeout: 8000 });
    if (input) {
      await input.setInputFiles(absoluteFilePath);
    }
  }

  async clickElement(selector: string): Promise<void> {
    if (!this.page) throw new Error("Browser page not initialized");
    await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
    await this.page.click(selector);
  }

  async detectBlockers(): Promise<{ isCaptcha: boolean; isAuthWall: boolean; message?: string }> {
    if (!this.page) return { isCaptcha: false, isAuthWall: false };

    const blocker = await this.page.evaluate(() => {
      const hasCaptcha = Boolean(
        document.querySelector(".g-recaptcha, iframe[src*='recaptcha'], iframe[src*='hcaptcha'], #cf-turnstile")
      );
      const hasAuthWall = Boolean(
        document.querySelector('input[type="password"], a[href*="login"], a[href*="signin"]') &&
        document.body.innerText.toLowerCase().includes("please sign in to apply")
      );
      return { hasCaptcha, hasAuthWall };
    });

    return {
      isCaptcha: blocker.hasCaptcha,
      isAuthWall: blocker.hasAuthWall,
      message: blocker.hasCaptcha
        ? "Anti-bot CAPTCHA detected."
        : blocker.hasAuthWall
        ? "Application requires signing into an account first."
        : undefined,
    };
  }

  async verifySubmission(): Promise<VerificationResult> {
    if (!this.page) throw new Error("Browser page not initialized");

    // Wait 4 seconds for post-submit redirects or inline thank-you messages
    await this.page.waitForTimeout(4000);

    const check = await this.page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const successPhrases = [
        "thank you for applying",
        "application submitted",
        "we received your application",
        "application has been received",
        "your application was submitted",
        "successfully submitted",
        "thanks for your interest",
        "application complete",
      ];

      const matched = successPhrases.find((phrase) => text.includes(phrase));
      return {
        isSubmitted: Boolean(matched),
        confirmationMessage: matched ? `Confirmation detected: "${matched}"` : undefined,
      };
    });

    return {
      isSubmitted: check.isSubmitted,
      confirmationMessage: check.confirmationMessage,
      currentUrl: this.page.url(),
    };
  }

  async closeSession(): Promise<void> {
    try {
      if (this.page) await this.page.close().catch(() => {});
      if (this.context) await this.context.close().catch(() => {});
      if (this.browser) await this.browser.close().catch(() => {});
    } finally {
      this.page = null;
      this.context = null;
      this.browser = null;
    }
  }
}
