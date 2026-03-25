/* global Module, ELEMENTS_DATA */

Module.register("MMM-AtomVisualizer", {
  defaults: {
    element: "C",
    elements: ["H", "He", "Li", "C", "N", "O", "Ne", "Na", "Fe", "Cu", "Ag", "Xe"],
    cycleElements: true,
    shuffleElements: true,
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
  },

  start () {
    this.sanitizeConfig();

    if (this.config.shuffleElements && this.config.cycleElements) {
      this.shuffleArray(this.config.elements);
    }

    if (this.config.cycleElements && this.config.elements.length > 0) {
      this.currentElementIndex = 0;
      this.activeSymbol = this.resolveSymbol(this.config.elements[0]);
      this.scheduleElementCycle();
    } else {
      this.currentElementIndex = 0;
      this.activeSymbol = this.resolveSymbol(this.config.element);
    }
  },

  getStyles () {
    return ["MMM-AtomVisualizer.css"];
  },

  getScripts () {
    return [this.file("data/elements.js")];
  },

  getTranslations () {
    return {
      en: "translations/en.json",
      de: "translations/de.json",
      nl: "translations/nl.json"
    };
  },

  getElementName (element, symbol) {
    const key = `ELEMENT_${symbol}`;
    const translated = this.translate(key);

    // If translate() returns the key itself, it has no translation — fall back to English name
    return translated === key
      ? element.name
      : translated;
  },

  sanitizeConfig () {
    this.config.size = Number.isFinite(this.config.size)
      ? Math.max(140, this.config.size)
      : 240;
    this.config.nucleusScale = Number.isFinite(this.config.nucleusScale)
      ? Math.min(0.4, Math.max(0.12, this.config.nucleusScale))
      : 0.22;
    this.config.electronSize = Number.isFinite(this.config.electronSize)
      ? Math.max(4, this.config.electronSize)
      : 7;
    this.config.electronSpeed = Number.isFinite(this.config.electronSpeed)
      ? Math.max(2, this.config.electronSpeed)
      : 8;
    this.config.rotationDuration = Number.isFinite(this.config.rotationDuration)
      ? Math.max(8, this.config.rotationDuration)
      : 32;
    this.config.cycleEvery = Number.isFinite(this.config.cycleEvery)
      ? Math.max(10, this.config.cycleEvery)
      : 60;

    if (!Array.isArray(this.config.elements) || this.config.elements.length === 0) {
      this.config.elements = [this.config.element];
    }

    this.config.elements = this.config.elements
      .map((symbol) => this.resolveSymbol(symbol))
      .filter((symbol, index, arr) => arr.indexOf(symbol) === index);

    if (this.config.elements.length === 0) {
      this.config.elements = ["C"];
    }
  },

  scheduleElementCycle () {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }

    this.cycleTimer = setInterval(() => {
      if (!this.config.cycleElements || this.config.elements.length < 2) {
        return;
      }

      this.currentElementIndex = (this.currentElementIndex + 1) % this.config.elements.length;
      this.activeSymbol = this.config.elements[this.currentElementIndex];
      this.updateDom(300);
    }, this.config.cycleEvery * 1000);
  },

  resolveSymbol (symbol) {
    if (typeof symbol !== "string") {
      return "C";
    }

    const normalized = symbol.trim();
    const entries = Object.keys(ELEMENTS_DATA);
    const match = entries.find((item) => item.toLowerCase() === normalized.toLowerCase());

    return match || "C";
  },

  shuffleArray (array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  createShellElements (shells) {
    const rotationLayer = document.createElement("div");
    rotationLayer.className = "atom-rotation-layer";
    if (this.config.autoRotate) {
      rotationLayer.classList.add("atom-stage--rotate");
    }

    const shellCount = shells.length;
    const maxRadius = this.config.size / 2 - this.config.electronSize * 1.2;
    const nucleusRadius = this.config.size * this.config.nucleusScale / 2;
    const orbitSpace = Math.max(14, (maxRadius - nucleusRadius) / Math.max(1, shellCount));

    shells.forEach((electronCount, shellIndex) => {
      const ring = this.createShellRing(electronCount, shellIndex, nucleusRadius, orbitSpace);
      rotationLayer.appendChild(ring);
    });

    return rotationLayer;
  },

  createShellRing (electronCount, shellIndex, nucleusRadius, orbitSpace) {
    const ring = document.createElement("div");
    ring.className = "atom-shell";

    const orbitRadius = nucleusRadius + orbitSpace * (shellIndex + 1);
    const orbitDiameter = Math.min(this.config.size - this.config.electronSize, orbitRadius * 2);

    ring.style.width = `${orbitDiameter}px`;
    ring.style.height = `${orbitDiameter}px`;
    ring.style.setProperty("--shell-z-rotation", `${shellIndex * 24}deg`);

    for (let index = 0; index < electronCount; index += 1) {
      const angle = 360 / electronCount * index;
      const track = this.createElectronTrack(angle, shellIndex);
      ring.appendChild(track);
    }

    return ring;
  },

  createElectronTrack (angle, shellIndex) {
    const track = document.createElement("div");
    track.className = "atom-electron-track";
    track.style.transform = `rotate(${angle}deg)`;

    const runner = document.createElement("div");
    runner.className = "atom-electron-runner";
    runner.style.animationDuration = `${this.config.electronSpeed + shellIndex * 1.2}s`;
    runner.style.animationDelay = `${shellIndex * -1.5}s`;
    if (this.config.mixedOrbitDirections && shellIndex % 2 === 1) {
      runner.style.animationDirection = "reverse";
    }

    const electron = document.createElement("div");
    electron.className = "atom-electron";

    runner.appendChild(electron);
    track.appendChild(runner);

    return track;
  },

  createAtomStage (symbol, shells) {
    const atom = document.createElement("div");
    atom.className = "atom-stage";
    atom.style.setProperty("--atom-size", `${this.config.size}px`);
    atom.style.setProperty("--nucleus-size", `${Math.round(this.config.size * this.config.nucleusScale)}px`);
    atom.style.setProperty("--electron-size", `${this.config.electronSize}px`);
    atom.style.setProperty("--rotation-duration", `${this.config.rotationDuration}s`);

    const rotationLayer = this.createShellElements(shells);
    atom.appendChild(rotationLayer);

    const nucleus = document.createElement("div");
    nucleus.className = "atom-nucleus";
    nucleus.innerText = symbol;
    atom.appendChild(nucleus);

    return atom;
  },

  createDetailsSection (element, symbol) {
    const details = document.createElement("div");
    details.className = "atom-details";

    if (this.config.showLabel) {
      const label = document.createElement("div");
      label.className = "atom-label";
      label.innerText = `${this.getElementName(element, symbol)} (${symbol})`;
      details.appendChild(label);
    }

    const extraItems = this.buildDetailsItems(element);
    if (extraItems.length > 0) {
      const grid = document.createElement("div");
      grid.className = "atom-detail-grid";
      for (const {label, value} of extraItems) {
        const keySpan = document.createElement("span");
        keySpan.className = "atom-detail-key";
        keySpan.innerText = label;
        const valSpan = document.createElement("span");
        valSpan.className = "atom-detail-val";
        valSpan.innerText = value;
        grid.appendChild(keySpan);
        grid.appendChild(valSpan);
      }
      details.appendChild(grid);
    }

    return details;
  },

  buildDetailsItems (element) {
    const fields = [
      {key: "showAtomicNumber", translateKey: "ATOMIC_NUMBER", format: (v) => String(v)},
      {key: "showShells", translateKey: "SHELLS", format: (v) => v.join("-")},
      {key: "showAtomicMass", translateKey: "DETAIL_ATOMIC_MASS", format: (v) => `${v} u`},
      {key: "showCategory", translateKey: "DETAIL_CATEGORY", format: (v) => this.translate(this.categoryKey(v))},
      {key: "showCas", translateKey: "DETAIL_CAS", format: (v) => v},
      {key: "showPhase", translateKey: "DETAIL_PHASE", format: (v) => this.translate(`PHASE_${v.toUpperCase()}`)},
      {key: "showElectronegativity", translateKey: "DETAIL_ELECTRONEGATIVITY", format: (v) => v},
      {key: "showDiscoveredBy", translateKey: "DETAIL_DISCOVERED_BY", format: (v) => v}
    ];

    const dataKeyOf = {
      showAtomicNumber: "number",
      showShells: "shells",
      showAtomicMass: "atomicMass",
      showCategory: "category",
      showCas: "cas",
      showPhase: "phase",
      showElectronegativity: "electronegativity",
      showDiscoveredBy: "discoveredBy"
    };

    const parts = fields
      .filter(({key}) => this.config[key] && element[dataKeyOf[key]] !== null && typeof element[dataKeyOf[key]] !== "undefined")
      .map(({key, translateKey, format}) => ({label: this.translate(translateKey), value: format(element[dataKeyOf[key]])}));

    return parts;
  },

  categoryKey (category) {
    return `CATEGORY_${category
      .replace(/, (?:predicted to be|probably) /u, "_")
      .replace(/[\s,.-]+/gu, "_")
      .toUpperCase()}`;
  },

  getDom () {
    const wrapper = document.createElement("div");
    wrapper.className = "mmm-atom-visualizer";

    const symbol = this.resolveSymbol(this.activeSymbol || this.config.element);
    const element = ELEMENTS_DATA[symbol];

    if (!element) {
      wrapper.innerText = this.translate("ATOM_UNKNOWN");
      return wrapper;
    }

    const shells = element.shells;
    const atom = this.createAtomStage(symbol, shells);
    wrapper.appendChild(atom);

    const showKeys = ["showLabel", "showAtomicNumber", "showShells", "showAtomicMass", "showCategory", "showCas", "showPhase", "showElectronegativity", "showDiscoveredBy"];
    if (showKeys.some((key) => this.config[key])) {
      const details = this.createDetailsSection(element, symbol);
      wrapper.appendChild(details);
    }

    return wrapper;
  },

  suspend () {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
  },

  resume () {
    if (this.config.cycleElements && this.config.elements.length > 1) {
      this.scheduleElementCycle();
    }
  }
});
