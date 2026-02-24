/* eslint-disable no-console */
/**
 * Build script to regenerate data/elements.json from external sources.
 *
 * Prerequisites — download raw data first:
 *
 *   curl -sL "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json" \
 *     -o /tmp/bowserinator.json
 *
 *   curl -sG "https://query.wikidata.org/sparql" \
 *     --data-urlencode "format=json" \
 *     --data-urlencode "query=SELECT ?number ?symbol ?cas WHERE { ?element wdt:P31 wd:Q11344 ; wdt:P1086 ?number ; wdt:P246 ?symbol . OPTIONAL { ?element wdt:P231 ?cas . } } ORDER BY ?number" \
 *     -o /tmp/wikidata_cas.json
 *
 * Then run:
 *   node data/build_elements.mjs
 *
 * Sources:
 *   - Bowserinator/Periodic-Table-JSON (CC BY-SA 3.0): https://github.com/Bowserinator/Periodic-Table-JSON
 *   - Wikidata (CC0): https://www.wikidata.org
 */

import {dirname, join} from "node:path";
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const bowserinator = JSON.parse(readFileSync("/tmp/bowserinator.json", "utf8"));
const wikidata = JSON.parse(readFileSync("/tmp/wikidata_cas.json", "utf8"));

// Build CAS map: pick shortest CAS per atomic number (most common form)
const casMap = {};
for (const r of wikidata.results.bindings) {
  const n = Number(r.number.value);
  const casValue = r.cas
    ? r.cas.value
    : null;
  if (casValue === null) {
    continue;
  }
  if (!(n in casMap) || casValue.length < casMap[n].length) {
    casMap[n] = casValue;
  }
}

// Manual additions for elements missing in Wikidata SPARQL
if (!(17 in casMap)) {
  casMap[17] = "7782-50-5";
} // Chlorine
if (!(35 in casMap)) {
  casMap[35] = "7726-95-6";
} // Bromine

// Process Bowserinator elements (1-118 only)
const elements = {};
for (const el of bowserinator.elements) {
  if (el.number < 1 || el.number > 118) {
    continue;
  }
  elements[el.symbol] = {
    number: el.number,
    name: el.name,
    atomicMass: el.atomic_mass,
    category: el.category,
    block: el.block,
    group: el.group,
    period: el.period,
    phase: el.phase,
    density: el.density,
    melt: el.melt,
    boil: el.boil,
    shells: el.shells,
    electronConfiguration: el.electron_configuration_semantic,
    electronegativity: el.electronegativity_pauling,
    electronAffinity: el.electron_affinity,
    discoveredBy: el.discovered_by,
    cas: casMap[el.number] || null
  };
}

const outPath = join(dirname(fileURLToPath(import.meta.url)), "elements.json");
const out = `${JSON.stringify(elements, null, 2)}\n`;
writeFileSync(outPath, out);

console.log("Elements:", Object.keys(elements).length);
console.log("With CAS:", Object.values(elements).filter((e) => e.cas).length);
console.log("Written to:", outPath);
