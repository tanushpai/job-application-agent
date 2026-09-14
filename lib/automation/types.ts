export interface DetectedFormField {
  label: string;
  fieldType: "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "file";
  isRequired: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  detectedMeaning?: string; // e.g. "first_name", "last_name", "full_name", "email", "phone", "resume", "linkedin", "github", "website", "location"
  selector: string;
  currentValue?: string;
  mappedProfileField?: string;
  confidence: number;
}

export interface InspectionResult {
  title?: string;
  platform: string; // "greenhouse" | "lever" | "workable" | "unknown"
  fields: DetectedFormField[];
  submitButtonSelector?: string;
  isMultiStep: boolean;
  isCaptchaPresent: boolean;
  isLoginRequired: boolean;
}

export interface FormFillValue {
  selector: string;
  fieldType: "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "file";
  value: string;
  options?: Array<{ label: string; value: string }>;
}

export interface VerificationResult {
  isSubmitted: boolean;
  confirmationMessage?: string;
  currentUrl?: string;
  error?: string;
}

export interface BrowserAutomationProvider {
  /**
   * Initializes the browser and context for a specific session.
   */
  initSession(sessionId: string, options?: { headless?: boolean }): Promise<void>;

  /**
   * Navigates to the job application URL.
   */
  navigateTo(url: string): Promise<{ finalUrl: string; title: string }>;

  /**
   * Captures a screenshot and saves it locally. Returns the relative web-accessible URL.
   */
  takeScreenshot(name: string): Promise<string | null>;

  /**
   * Inspects the DOM and detects form fields and application structure.
   */
  inspectForm(): Promise<InspectionResult>;

  /**
   * Fills a text/textarea/email/phone field.
   */
  fillField(selector: string, value: string): Promise<void>;

  /**
   * Selects an option in a standard select or customized dropdown.
   */
  selectOption(selector: string, value: string): Promise<void>;

  /**
   * Sets checkbox or radio button state.
   */
  checkInput(selector: string, checked: boolean): Promise<void>;

  /**
   * Uploads a file to a file input element.
   */
  uploadFile(selector: string, absoluteFilePath: string): Promise<void>;

  /**
   * Clicks an element (e.g. Next page, Submit).
   */
  clickElement(selector: string): Promise<void>;

  /**
   * Checks for bot detection, captcha, or login walls.
   */
  detectBlockers(): Promise<{ isCaptcha: boolean; isAuthWall: boolean; message?: string }>;

  /**
   * Verifies whether submission succeeded.
   */
  verifySubmission(): Promise<VerificationResult>;

  /**
   * Safely closes the page and browser.
   */
  closeSession(): Promise<void>;
}
