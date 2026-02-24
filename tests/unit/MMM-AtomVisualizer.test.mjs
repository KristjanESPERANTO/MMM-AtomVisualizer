/* eslint-disable no-underscore-dangle */

import {beforeEach, describe, it, mock} from "node:test";
import {dirname, join} from "node:path";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock MagicMirror globals
let moduleDefinition = null;

global.Module = {
  register (name, definition) {
    moduleDefinition = definition;
    return definition;
  }
};

global.Log = {
  info: mock.fn(),
  log: mock.fn(),
  debug: mock.fn(),
  warn: mock.fn(),
  error: mock.fn()
};

// Load the module by executing it in the global context
const modulePath = join(__dirname, "../../MMM-AtomVisualizer.js");
const moduleCode = readFileSync(modulePath, "utf8");
const script = new vm.Script(moduleCode, {filename: "MMM-AtomVisualizer.js"});
const context = vm.createContext({
  Module: global.Module,
  Log: global.Log,
  document: {},
  window: {},
  console: global.console,
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  setInterval: global.setInterval,
  clearInterval: global.clearInterval,
  ELEMENTS_DATA: JSON.parse(readFileSync(join(__dirname, "../../data/elements.json"), "utf8"))
});
script.runInContext(context);

describe("MMM-AtomVisualizer Core Functions", () => {
  let instance;

  beforeEach(() => {
    // Create a fresh instance for each test
    instance = Object.create(moduleDefinition);
    instance.config = {
      element: "C",
      elements: ["H", "He", "Li", "C", "N", "O"],
      cycleElements: false,
      shuffleElements: false,
      cycleEvery: 60,
      size: 240,
      nucleusScale: 0.22,
      electronSize: 7,
      electronSpeed: 10,
      mixedOrbitDirections: true,
      autoRotate: true,
      rotationDuration: 42,
      showLabel: true,
      showAtomicNumber: true,
      showShells: true,
      showAtomicMass: true,
      showCategory: true,
      showCas: true,
      showPhase: true,
      showElectronegativity: true,
      showDiscoveredBy: true
    };
    instance.translate = (key) => key;
  });

  describe("resolveSymbol", () => {
    it("should return valid symbol for correct input", () => {
      assert.equal(instance.resolveSymbol("H"), "H");
      assert.equal(instance.resolveSymbol("C"), "C");
      assert.equal(instance.resolveSymbol("Fe"), "Fe");
      assert.equal(instance.resolveSymbol("Au"), "Au");
    });

    it("should handle case-insensitive input", () => {
      assert.equal(instance.resolveSymbol("h"), "H");
      assert.equal(instance.resolveSymbol("fe"), "Fe");
      assert.equal(instance.resolveSymbol("AU"), "Au");
    });

    it("should handle whitespace", () => {
      assert.equal(instance.resolveSymbol("  H  "), "H");
      assert.equal(instance.resolveSymbol(" Fe "), "Fe");
    });

    it("should return C for invalid symbols", () => {
      assert.equal(instance.resolveSymbol("XX"), "C");
      assert.equal(instance.resolveSymbol(""), "C");
      assert.equal(instance.resolveSymbol("InvalidElement"), "C");
    });

    it("should return C for non-string input", () => {
      assert.equal(instance.resolveSymbol(123), "C");
      assert.equal(instance.resolveSymbol(null), "C");
      assert.equal(instance.resolveSymbol(undefined), "C");
      assert.equal(instance.resolveSymbol({}), "C");
    });
  });

  describe("sanitizeConfig", () => {
    it("should enforce minimum size of 140", () => {
      instance.config.size = 100;
      instance.sanitizeConfig();
      assert.equal(instance.config.size, 140);
    });

    it("should allow valid size values", () => {
      instance.config.size = 300;
      instance.sanitizeConfig();
      assert.equal(instance.config.size, 300);
    });

    it("should enforce nucleusScale range (0.12 - 0.4)", () => {
      instance.config.nucleusScale = 0.05;
      instance.sanitizeConfig();
      assert.equal(instance.config.nucleusScale, 0.12);

      instance.config.nucleusScale = 0.5;
      instance.sanitizeConfig();
      assert.equal(instance.config.nucleusScale, 0.4);
    });

    it("should enforce minimum electronSize of 4", () => {
      instance.config.electronSize = 2;
      instance.sanitizeConfig();
      assert.equal(instance.config.electronSize, 4);
    });

    it("should enforce minimum electronSpeed of 2", () => {
      instance.config.electronSpeed = 1;
      instance.sanitizeConfig();
      assert.equal(instance.config.electronSpeed, 2);
    });

    it("should enforce minimum rotationDuration of 8", () => {
      instance.config.rotationDuration = 5;
      instance.sanitizeConfig();
      assert.equal(instance.config.rotationDuration, 8);
    });

    it("should enforce minimum cycleEvery of 10", () => {
      instance.config.cycleEvery = 5;
      instance.sanitizeConfig();
      assert.equal(instance.config.cycleEvery, 10);
    });

    it("should convert invalid size to default 240", () => {
      instance.config.size = "invalid";
      instance.sanitizeConfig();
      assert.equal(instance.config.size, 240);
    });

    it("should remove duplicate elements from array", () => {
      instance.config.elements = ["H", "C", "H", "O", "C"];
      instance.sanitizeConfig();
      assert.deepEqual(instance.config.elements, ["H", "C", "O"]);
    });

    it("should resolve invalid element symbols to C and remove duplicates", () => {
      instance.config.elements = ["H", "XX", "InvalidElement"];
      instance.sanitizeConfig();
      assert.deepEqual(instance.config.elements, ["H", "C"]);
    });

    it("should default to C if elements array is empty", () => {
      instance.config.elements = [];
      instance.sanitizeConfig();
      assert.strictEqual(JSON.stringify(instance.config.elements), JSON.stringify(["C"]));
    });

    it("should use config.element if elements is not an array", () => {
      instance.config.elements = "not an array";
      instance.config.element = "O";
      instance.sanitizeConfig();
      assert.strictEqual(JSON.stringify(instance.config.elements), JSON.stringify(["O"]));
    });
  });

  describe("categoryKey", () => {
    it("should convert simple categories", () => {
      assert.equal(instance.categoryKey("actinide"), "CATEGORY_ACTINIDE");
      assert.equal(instance.categoryKey("noble gas"), "CATEGORY_NOBLE_GAS");
      assert.equal(instance.categoryKey("transition metal"), "CATEGORY_TRANSITION_METAL");
      assert.equal(instance.categoryKey("post-transition metal"), "CATEGORY_POST_TRANSITION_METAL");
    });

    it("should handle unknown variants", () => {
      assert.equal(instance.categoryKey("unknown, predicted to be noble gas"), "CATEGORY_UNKNOWN_NOBLE_GAS");
      assert.equal(instance.categoryKey("unknown, probably metalloid"), "CATEGORY_UNKNOWN_METALLOID");
      assert.equal(instance.categoryKey("unknown, probably post-transition metal"), "CATEGORY_UNKNOWN_POST_TRANSITION_METAL");
    });
  });

  describe("buildDetailsItems", () => {
    it("should return empty array when all data fields are disabled", () => {
      instance.config.showAtomicMass = false;
      instance.config.showCategory = false;
      instance.config.showCas = false;
      instance.config.showPhase = false;
      instance.config.showElectronegativity = false;
      instance.config.showDiscoveredBy = false;
      const result = instance.buildDetailsItems({atomicMass: 12.011, cas: "7440-44-0"});
      assert.strictEqual(JSON.stringify(result), JSON.stringify([]));
    });

    it("should return single-item array for one enabled field", () => {
      instance.config.showAtomicMass = true;
      instance.config.showCategory = false;
      instance.config.showCas = false;
      instance.config.showPhase = false;
      instance.config.showElectronegativity = false;
      instance.config.showDiscoveredBy = false;
      const result = instance.buildDetailsItems({atomicMass: 12.011});
      assert.strictEqual(JSON.stringify(result), JSON.stringify([{label: "DETAIL_ATOMIC_MASS", value: "12.011 u"}]));
    });

    it("should return array with one entry per enabled field", () => {
      instance.config.showAtomicMass = true;
      instance.config.showCategory = false;
      instance.config.showCas = true;
      instance.config.showPhase = false;
      instance.config.showElectronegativity = false;
      instance.config.showDiscoveredBy = false;
      const result = instance.buildDetailsItems({atomicMass: 1.008, cas: "12385-13-6"});
      assert.strictEqual(JSON.stringify(result), JSON.stringify([{label: "DETAIL_ATOMIC_MASS", value: "1.008 u"}, {label: "DETAIL_CAS", value: "12385-13-6"}]));
    });

    it("should skip enabled fields with null values", () => {
      instance.config.showAtomicMass = true;
      instance.config.showCategory = false;
      instance.config.showCas = false;
      instance.config.showPhase = false;
      instance.config.showElectronegativity = true;
      instance.config.showDiscoveredBy = false;
      const result = instance.buildDetailsItems({atomicMass: 226, electronegativity: null});
      assert.strictEqual(JSON.stringify(result), JSON.stringify([{label: "DETAIL_ATOMIC_MASS", value: "226 u"}]));
    });
  });

  describe("shuffleArray", () => {
    it("should not change array length", () => {
      const arr = [1, 2, 3, 4, 5];
      const originalLength = arr.length;
      instance.shuffleArray(arr);
      assert.equal(arr.length, originalLength);
    });

    it("should contain same elements after shuffle", () => {
      const arr = [1, 2, 3, 4, 5];
      const originalSet = new Set(arr);
      instance.shuffleArray(arr);
      const shuffledSet = new Set(arr);
      assert.deepEqual(shuffledSet, originalSet);
    });

    it("should handle empty array", () => {
      const arr = [];
      instance.shuffleArray(arr);
      assert.deepEqual(arr, []);
    });

    it("should handle single element array", () => {
      const arr = [1];
      instance.shuffleArray(arr);
      assert.deepEqual(arr, [1]);
    });

    it("should handle two element array", () => {
      const arr = [1, 2];
      instance.shuffleArray(arr);
      assert.equal(arr.length, 2);
      assert.ok(arr.includes(1));
      assert.ok(arr.includes(2));
    });
  });
});
