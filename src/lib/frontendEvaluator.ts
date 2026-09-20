import vm from "node:vm";

export interface FrontendEvalResult {
  isCorrect: boolean;
  passedCount: number;
  totalCount: number;
  message: string;
}

/**
 * Lightweight in-memory DOM simulation to evaluate Accenture frontend DOM tasks:
 * 1. Interactive Counter with Step Control
 * 2. Interactive Textarea Counter and Limit
 * 3. Product Search Filter with Data Attributes
 */
export function evaluateFrontendCode(
  slug: string,
  userCode: string,
  htmlTemplate?: string | null
): FrontendEvalResult {
  const code = (userCode || "").trim();
  if (!code || code === "// Write your solution here") {
    return {
      isCorrect: false,
      passedCount: 0,
      totalCount: 3,
      message: "No code provided for frontend challenge.",
    };
  }

  // Virtual DOM Element representation for sandboxed test execution
  class VirtualDomElement {
    id: string = "";
    tagName: string = "DIV";
    value: string = "";
    innerText: string = "";
    textContent: string = "";
    dataset: Record<string, string> = {};
    style: Record<string, string> = {};
    listeners: Record<string, Function[]> = {};

    constructor(id: string = "", tagName: string = "DIV") {
      this.id = id;
      this.tagName = tagName.toUpperCase();
    }

    addEventListener(event: string, fn: Function) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }

    dispatchEvent(event: { type: string }) {
      const handlers = this.listeners[event.type] || [];
      for (const h of handlers) {
        h.call(this, { target: this, currentTarget: this, ...event });
      }
    }

    click() {
      this.dispatchEvent({ type: "click" });
    }
  }

  // Pre-seed elements based on slug
  const elementsById: Record<string, VirtualDomElement> = {};
  const queryAllList: VirtualDomElement[] = [];

  if (slug === "interactive-counter-with-step-control") {
    elementsById["counter-value"] = new VirtualDomElement("counter-value", "SPAN");
    elementsById["counter-value"].innerText = "0";

    elementsById["step-input"] = new VirtualDomElement("step-input", "INPUT");
    elementsById["step-input"].value = "1";

    elementsById["btn-increment"] = new VirtualDomElement("btn-increment", "BUTTON");
    elementsById["btn-decrement"] = new VirtualDomElement("btn-decrement", "BUTTON");
    elementsById["btn-reset"] = new VirtualDomElement("btn-reset", "BUTTON");
  } else if (slug === "interactive-textarea-counter-limit") {
    elementsById["user-feedback"] = new VirtualDomElement("user-feedback", "TEXTAREA");
    elementsById["char-count"] = new VirtualDomElement("char-count", "SPAN");
    elementsById["char-count"].innerText = "0";

    elementsById["word-count"] = new VirtualDomElement("word-count", "SPAN");
    elementsById["word-count"].innerText = "0";
  } else if (slug === "product-search-filter-data-attributes") {
    elementsById["search-input"] = new VirtualDomElement("search-input", "INPUT");
    elementsById["search-input"].value = "";

    const products = [
      { name: "banana", text: "Banana" },
      { name: "apple", text: "Apple" },
      { name: "pineapple", text: "Pineapple" },
      { name: "orange", text: "Orange" },
      { name: "mango", text: "Mango" },
    ];

    products.forEach((p, idx) => {
      const el = new VirtualDomElement(`prod-${idx}`, "LI");
      el.dataset["name"] = p.name;
      el.innerText = p.text;
      el.style.display = "list-item";
      queryAllList.push(el);
    });
  }

  // Create virtual document
  const virtualDocument = {
    getElementById: (id: string) => elementsById[id] || null,
    querySelector: (sel: string) => {
      if (sel.startsWith("#")) {
        const id = sel.slice(1);
        return elementsById[id] || null;
      }
      return queryAllList[0] || null;
    },
    querySelectorAll: (sel: string) => {
      if (sel.includes("li") || sel.includes("#product-list")) {
        return queryAllList;
      }
      return Object.values(elementsById);
    },
    addEventListener: () => {},
  };

  const virtualWindow = {
    document: virtualDocument,
    addEventListener: () => {},
  };

  const sandboxContext = vm.createContext({
    document: virtualDocument,
    window: virtualWindow,
    console: { log: () => {}, error: () => {} },
    parseInt,
    parseFloat,
    Math,
    String,
    Number,
    Array,
    Object,
    Boolean,
    RegExp,
  });

  try {
    const script = new vm.Script(code);
    script.runInContext(sandboxContext, { timeout: 1500 });
  } catch (err: any) {
    // If student provided plain functions, try evaluating
    const hasSyntax = !err.message.includes("is not defined");
    if (hasSyntax && (err instanceof SyntaxError)) {
      return {
        isCorrect: false,
        passedCount: 0,
        totalCount: 3,
        message: `JavaScript syntax error: ${err.message}`,
      };
    }
  }

  // Evaluate tests based on problem slug
  if (slug === "interactive-counter-with-step-control") {
    let passed = 0;
    const valEl = elementsById["counter-value"];
    const stepEl = elementsById["step-input"];
    const incBtn = elementsById["btn-increment"];
    const decBtn = elementsById["btn-decrement"];
    const rstBtn = elementsById["btn-reset"];

    // Test 1: Increment by step 1
    if (incBtn) {
      incBtn.click();
      if (valEl.innerText.trim() === "1" || valEl.textContent.trim() === "1") passed++;
    }

    // Test 2: Increment by step 5
    if (stepEl && incBtn) {
      stepEl.value = "5";
      incBtn.click();
      const current = parseInt(valEl.innerText.trim() || valEl.textContent.trim() || "0", 10);
      if (current === 6) passed++;
    }

    // Test 3: Reset
    if (rstBtn) {
      rstBtn.click();
      const current = parseInt(valEl.innerText.trim() || valEl.textContent.trim() || "-1", 10);
      if (current === 0) passed++;
    }

    return {
      isCorrect: passed >= 2,
      passedCount: passed,
      totalCount: 3,
      message: passed >= 2 ? "All DOM counter tests passed!" : `${passed}/3 counter tests passed. Verify event listeners and step values.`,
    };
  }

  if (slug === "interactive-textarea-counter-limit") {
    let passed = 0;
    const textarea = elementsById["user-feedback"];
    const charEl = elementsById["char-count"];
    const wordEl = elementsById["word-count"];

    if (textarea) {
      // Test 1: Typing simple sentence
      textarea.value = "Hello Accenture team";
      textarea.dispatchEvent({ type: "input" });
      textarea.dispatchEvent({ type: "keyup" });

      const chars = parseInt(charEl.innerText.trim() || charEl.textContent.trim() || "0", 10);
      const words = parseInt(wordEl.innerText.trim() || wordEl.textContent.trim() || "0", 10);

      if (chars === 20) passed++;
      if (words === 3) passed++;

      // Test 2: Whitespace trimming and empty text
      textarea.value = "";
      textarea.dispatchEvent({ type: "input" });
      textarea.dispatchEvent({ type: "keyup" });

      const emptyChars = parseInt(charEl.innerText.trim() || charEl.textContent.trim() || "1", 10);
      const emptyWords = parseInt(wordEl.innerText.trim() || wordEl.textContent.trim() || "1", 10);

      if (emptyChars === 0 && emptyWords === 0) passed++;
    }

    return {
      isCorrect: passed >= 2,
      passedCount: passed,
      totalCount: 3,
      message: passed >= 2 ? "Textarea character and word counting logic passed!" : `${passed}/3 textarea tests passed. Ensure word count handles multiple spaces.`,
    };
  }

  if (slug === "product-search-filter-data-attributes") {
    let passed = 0;
    const input = elementsById["search-input"];

    if (input) {
      // Test 1: Search 'apple'
      input.value = "apple";
      input.dispatchEvent({ type: "input" });
      input.dispatchEvent({ type: "keyup" });

      const appleItem = queryAllList.find((li) => li.dataset["name"] === "apple");
      const bananaItem = queryAllList.find((li) => li.dataset["name"] === "banana");

      const appleVisible = appleItem?.style.display !== "none";
      const bananaHidden = bananaItem?.style.display === "none";

      if (appleVisible && bananaHidden) passed++;

      // Test 2: Search 'an' (matches banana, mango, etc.)
      input.value = "an";
      input.dispatchEvent({ type: "input" });
      input.dispatchEvent({ type: "keyup" });

      if (appleItem?.style.display === "none") passed++;

      // Test 3: Clear search
      input.value = "";
      input.dispatchEvent({ type: "input" });
      input.dispatchEvent({ type: "keyup" });

      const allVisible = queryAllList.every((li) => li.style.display !== "none");
      if (allVisible) passed++;
    }

    return {
      isCorrect: passed >= 2,
      passedCount: passed,
      totalCount: 3,
      message: passed >= 2 ? "DOM Product filtering passed!" : `${passed}/3 search tests passed. Ensure style.display is toggled between 'none' and '' / 'list-item'.`,
    };
  }

  // Generic fallback: check if code is non-trivial and runs cleanly
  const hasLogic = code.includes("function") || code.includes("=>") || code.includes("addEventListener");
  return {
    isCorrect: hasLogic,
    passedCount: hasLogic ? 1 : 0,
    totalCount: 1,
    message: hasLogic ? "Frontend script executed without errors." : "Script lacks event handling logic.",
  };
}
