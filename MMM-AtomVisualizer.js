/* global Module */

const ELEMENT_LIST = [
  ["H", "Hydrogen"], ["He", "Helium"], ["Li", "Lithium"], ["Be", "Beryllium"], ["B", "Boron"], ["C", "Carbon"],
  ["N", "Nitrogen"], ["O", "Oxygen"], ["F", "Fluorine"], ["Ne", "Neon"], ["Na", "Sodium"], ["Mg", "Magnesium"],
  ["Al", "Aluminum"], ["Si", "Silicon"], ["P", "Phosphorus"], ["S", "Sulfur"], ["Cl", "Chlorine"], ["Ar", "Argon"],
  ["K", "Potassium"], ["Ca", "Calcium"], ["Sc", "Scandium"], ["Ti", "Titanium"], ["V", "Vanadium"], ["Cr", "Chromium"],
  ["Mn", "Manganese"], ["Fe", "Iron"], ["Co", "Cobalt"], ["Ni", "Nickel"], ["Cu", "Copper"], ["Zn", "Zinc"],
  ["Ga", "Gallium"], ["Ge", "Germanium"], ["As", "Arsenic"], ["Se", "Selenium"], ["Br", "Bromine"], ["Kr", "Krypton"],
  ["Rb", "Rubidium"], ["Sr", "Strontium"], ["Y", "Yttrium"], ["Zr", "Zirconium"], ["Nb", "Niobium"], ["Mo", "Molybdenum"],
  ["Tc", "Technetium"], ["Ru", "Ruthenium"], ["Rh", "Rhodium"], ["Pd", "Palladium"], ["Ag", "Silver"], ["Cd", "Cadmium"],
  ["In", "Indium"], ["Sn", "Tin"], ["Sb", "Antimony"], ["Te", "Tellurium"], ["I", "Iodine"], ["Xe", "Xenon"],
  ["Cs", "Cesium"], ["Ba", "Barium"], ["La", "Lanthanum"], ["Ce", "Cerium"], ["Pr", "Praseodymium"], ["Nd", "Neodymium"],
  ["Pm", "Promethium"], ["Sm", "Samarium"], ["Eu", "Europium"], ["Gd", "Gadolinium"], ["Tb", "Terbium"], ["Dy", "Dysprosium"],
  ["Ho", "Holmium"], ["Er", "Erbium"], ["Tm", "Thulium"], ["Yb", "Ytterbium"], ["Lu", "Lutetium"], ["Hf", "Hafnium"],
  ["Ta", "Tantalum"], ["W", "Tungsten"], ["Re", "Rhenium"], ["Os", "Osmium"], ["Ir", "Iridium"], ["Pt", "Platinum"],
  ["Au", "Gold"], ["Hg", "Mercury"], ["Tl", "Thallium"], ["Pb", "Lead"], ["Bi", "Bismuth"], ["Po", "Polonium"],
  ["At", "Astatine"], ["Rn", "Radon"], ["Fr", "Francium"], ["Ra", "Radium"], ["Ac", "Actinium"], ["Th", "Thorium"],
  ["Pa", "Protactinium"], ["U", "Uranium"], ["Np", "Neptunium"], ["Pu", "Plutonium"], ["Am", "Americium"], ["Cm", "Curium"],
  ["Bk", "Berkelium"], ["Cf", "Californium"], ["Es", "Einsteinium"], ["Fm", "Fermium"], ["Md", "Mendelevium"], ["No", "Nobelium"],
  ["Lr", "Lawrencium"], ["Rf", "Rutherfordium"], ["Db", "Dubnium"], ["Sg", "Seaborgium"], ["Bh", "Bohrium"], ["Hs", "Hassium"],
  ["Mt", "Meitnerium"], ["Ds", "Darmstadtium"], ["Rg", "Roentgenium"], ["Cn", "Copernicium"], ["Nh", "Nihonium"], ["Fl", "Flerovium"],
  ["Mc", "Moscovium"], ["Lv", "Livermorium"], ["Ts", "Tennessine"], ["Og", "Oganesson"]
];

const ELEMENTS = Object.fromEntries(ELEMENT_LIST.map(([symbol, name], index) => [symbol, {number: index + 1, name}]));

const ORBITALS = [
  {id: "1s", n: 1, capacity: 2},
  {id: "2s", n: 2, capacity: 2},
  {id: "2p", n: 2, capacity: 6},
  {id: "3s", n: 3, capacity: 2},
  {id: "3p", n: 3, capacity: 6},
  {id: "4s", n: 4, capacity: 2},
  {id: "3d", n: 3, capacity: 10},
  {id: "4p", n: 4, capacity: 6},
  {id: "5s", n: 5, capacity: 2},
  {id: "4d", n: 4, capacity: 10},
  {id: "5p", n: 5, capacity: 6},
  {id: "6s", n: 6, capacity: 2},
  {id: "4f", n: 4, capacity: 14},
  {id: "5d", n: 5, capacity: 10},
  {id: "6p", n: 6, capacity: 6},
  {id: "7s", n: 7, capacity: 2},
  {id: "5f", n: 5, capacity: 14},
  {id: "6d", n: 6, capacity: 10},
  {id: "7p", n: 7, capacity: 6}
];

const EXCEPTIONAL_ORBITALS = {
  24: {"4s": 1, "3d": 5},
  29: {"4s": 1, "3d": 10},
  41: {"5s": 1, "4d": 4},
  42: {"5s": 1, "4d": 5},
  44: {"5s": 1, "4d": 7},
  45: {"5s": 1, "4d": 8},
  46: {"5s": 0, "4d": 10},
  47: {"5s": 1, "4d": 10},
  57: {"4f": 0, "5d": 1},
  58: {"4f": 1, "5d": 1},
  64: {"4f": 7, "5d": 1},
  78: {"6s": 1, "5d": 9},
  79: {"6s": 1, "5d": 10},
  89: {"5f": 0, "6d": 1},
  90: {"5f": 0, "6d": 2},
  91: {"5f": 2, "6d": 1},
  92: {"5f": 3, "6d": 1},
  93: {"5f": 4, "6d": 1},
  96: {"5f": 7, "6d": 1},
  103: {"6d": 0, "7p": 1}
};

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
    showLegend: true
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

  getTranslations () {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
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
    const entries = Object.keys(ELEMENTS);
    const match = entries.find((item) => item.toLowerCase() === normalized.toLowerCase());

    return match || "C";
  },

  shuffleArray (array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  getShellDistribution (atomicNumber) {
    const orbitalOccupancy = {};
    const exception = EXCEPTIONAL_ORBITALS[atomicNumber];

    // Initialize all orbitals to 0
    ORBITALS.forEach((orbital) => {
      orbitalOccupancy[orbital.id] = 0;
    });

    // Apply exceptions first if they exist
    let placedElectrons = 0;
    if (exception) {
      Object.entries(exception).forEach(([orbitalId, count]) => {
        orbitalOccupancy[orbitalId] = count;
        placedElectrons += count;
      });
    }

    // Fill remaining electrons according to Aufbau principle
    let remaining = atomicNumber - placedElectrons;

    if (remaining > 0) {
      for (const orbital of ORBITALS) {
        // If this orbital was already handled by exception, skip it or fill only remainder?
        // Simple approach: Only fill if not defined in exception (or if we want to add to it, but standard exceptions usually define the full state of the outer shells)
        // Better scientific approach: Exceptions usually affect specific outer shells. Inner shells stay standard.
        // But since we track "remaining", we must be careful not to double fill.

        // Fix: Simply fill up to capacity, but respect pre-filled values
        if (!exception || typeof exception[orbital.id] === "undefined") {
          const capacity = orbital.capacity;
          const current = orbitalOccupancy[orbital.id];
          const canTake = capacity - current;
          const take = Math.min(canTake, remaining);

          orbitalOccupancy[orbital.id] += take;
          remaining -= take;

          if (remaining <= 0) {
            break;
          }
        }
      }
    }

    const shells = [0, 0, 0, 0, 0, 0, 0];
    ORBITALS.forEach((orbital) => {
      shells[orbital.n - 1] += orbitalOccupancy[orbital.id] || 0;
    });

    return shells.filter((count) => count > 0);
  },

  getDom () {
    const wrapper = document.createElement("div");
    wrapper.className = "mmm-atom-visualizer";

    const symbol = this.resolveSymbol(this.activeSymbol || this.config.element);
    const element = ELEMENTS[symbol];

    if (!element) {
      wrapper.innerText = this.translate("ATOM_UNKNOWN");
      return wrapper;
    }

    const shells = this.getShellDistribution(element.number);

    const atom = document.createElement("div");
    atom.className = "atom-stage";
    atom.style.setProperty("--atom-size", `${this.config.size}px`);
    atom.style.setProperty("--nucleus-size", `${Math.round(this.config.size * this.config.nucleusScale)}px`);
    atom.style.setProperty("--electron-size", `${this.config.electronSize}px`);
    atom.style.setProperty("--rotation-duration", `${this.config.rotationDuration}s`);

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
      const ring = document.createElement("div");
      ring.className = "atom-shell";

      const orbitRadius = nucleusRadius + orbitSpace * (shellIndex + 1);
      const orbitDiameter = Math.min(this.config.size - this.config.electronSize, orbitRadius * 2);

      ring.style.width = `${orbitDiameter}px`;
      ring.style.height = `${orbitDiameter}px`;
      ring.style.setProperty("--shell-z-rotation", `${shellIndex * 24}deg`);

      for (let index = 0; index < electronCount; index += 1) {
        const angle = 360 / electronCount * index;
        const track = document.createElement("div");
        track.className = "atom-electron-track";

        track.style.transform = `rotate(${angle}deg)`;

        const runner = document.createElement("div");
        runner.className = "atom-electron-runner";
        runner.style.animationDuration = `${this.config.electronSpeed + shellIndex * 1.2}s`;
        // Use a fixed delay per shell to keep electrons synchronized in their relative spacing
        runner.style.animationDelay = `${shellIndex * -1.5}s`;
        if (this.config.mixedOrbitDirections && shellIndex % 2 === 1) {
          runner.style.animationDirection = "reverse";
        }

        const electron = document.createElement("div");
        electron.className = "atom-electron";

        runner.appendChild(electron);
        track.appendChild(runner);
        ring.appendChild(track);
      }

      rotationLayer.appendChild(ring);
    });

    atom.appendChild(rotationLayer);

    const nucleus = document.createElement("div");
    nucleus.className = "atom-nucleus";
    nucleus.innerText = symbol;
    atom.appendChild(nucleus);

    wrapper.appendChild(atom);

    if (this.config.showLabel || this.config.showLegend) {
      const details = document.createElement("div");
      details.className = "atom-details";

      if (this.config.showLabel) {
        const label = document.createElement("div");
        label.className = "atom-label";
        label.innerText = `${element.name} (${symbol})`;
        details.appendChild(label);
      }

      if (this.config.showLegend) {
        const legend = document.createElement("div");
        legend.className = "atom-legend";
        const atomicNumberLabel = this.translate("ATOMIC_NUMBER");
        const shellsLabel = this.translate("SHELLS");
        legend.innerText = `${atomicNumberLabel}: ${element.number} · ${shellsLabel}: ${shells.join("-")}`;
        details.appendChild(legend);
      }

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
