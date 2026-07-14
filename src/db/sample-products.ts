import type { NewProduct } from "./schema";

type SampleProduct = Omit<NewProduct, "id" | "createdAt" | "updatedAt">;

export const sampleProducts = [
  {
    slug: "heliomax-450w-solar-panel",
    name: "HelioMax 450W Panel",
    description:
      "High-output monocrystalline module engineered for hot Australian rooftops and reliable daily yield.",
    category: "Solar panels",
    manufacturer: "Aster Energy",
    specification: "450W · 22.5% efficiency",
    priceCents: 32900,
    stock: 84,
    featured: true,
  },
  {
    slug: "voltstream-10kw-hybrid-inverter",
    name: "VoltStream Hybrid Inverter",
    description:
      "A three-phase hybrid inverter with seamless battery integration, blackout protection, and smart export control.",
    category: "Inverters",
    manufacturer: "Current Works",
    specification: "10kW · 3 phase",
    priceCents: 389900,
    stock: 19,
    featured: true,
  },
  {
    slug: "terravault-13-battery",
    name: "TerraVault Home Battery",
    description:
      "Modular lithium iron phosphate storage that keeps essential circuits powered long after the sun goes down.",
    category: "Battery storage",
    manufacturer: "Terra Systems",
    specification: "13.5kWh · LFP",
    priceCents: 899000,
    stock: 12,
    featured: true,
  },
  {
    slug: "driveray-22kw-ev-charger",
    name: "DriveRay EV Charger",
    description:
      "Solar-aware charging that automatically uses rooftop surplus before drawing power from the grid.",
    category: "EV charging",
    manufacturer: "Motion Electric",
    specification: "22kW · Type 2",
    priceCents: 124900,
    stock: 31,
    featured: false,
  },
  {
    slug: "sunguide-roof-rail-kit",
    name: "SunGuide Roof Rail Kit",
    description:
      "Installer-ready rail, clamps, and flashing for a tidy, wind-rated array on common corrugated roofs.",
    category: "Mounting",
    manufacturer: "Array Hardware Co.",
    specification: "8-panel kit · 4.8m",
    priceCents: 64900,
    stock: 43,
    featured: false,
  },
  {
    slug: "gridguard-smart-meter",
    name: "GridGuard Smart Meter",
    description:
      "Real-time household energy monitoring with import, export, solar generation, and load-balancing insights.",
    category: "Energy management",
    manufacturer: "Lucid Grid",
    specification: "3 phase · Wi-Fi",
    priceCents: 27900,
    stock: 67,
    featured: false,
  },
] satisfies SampleProduct[];
