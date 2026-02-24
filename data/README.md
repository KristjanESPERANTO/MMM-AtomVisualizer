# Element Data

## elements.json

Static dataset with properties of all 118 chemical elements, keyed by symbol.

### Fields per element

| Field                   | Type     | Example (Iron)     |
| ----------------------- | -------- | ------------------ |
| `number`                | number   | 26                 |
| `name`                  | string   | "Iron"             |
| `atomicMass`            | number   | 55.845             |
| `category`              | string   | "transition metal" |
| `block`                 | string   | "d"                |
| `group`                 | number   | 8                  |
| `period`                | number   | 4                  |
| `phase`                 | string   | "Solid"            |
| `density`               | number   | 7.874              |
| `melt`                  | number   | 1811 (K)           |
| `boil`                  | number   | 3134 (K)           |
| `shells`                | number[] | `[2, 8, 14, 2]`    |
| `electronConfiguration` | string   | `"[Ar] 3d6 4s2"`   |
| `electronegativity`     | number   | 1.83               |
| `electronAffinity`      | number   | 14.785 (kJ/mol)    |
| `discoveredBy`          | string   | "5000 BC"          |
| `cas`                   | string   | "7439-89-6"        |

### Sources

- **Physical properties**: [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) — CC BY-SA 3.0
- **CAS registry numbers**: [Wikidata](https://www.wikidata.org) — CC0

### Regenerating

To regenerate `elements.json` from the original sources, see the instructions in `build_elements.mjs`.
