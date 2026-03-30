import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema, insertContactMessageSchema, insertJobApplicationSchema, insertCatalogDownloadSchema, insertProductSchema, insertJobSchema, insertSectorSchema } from "@shared/schema";
import { seedDatabase } from "./seed";
import { requireAdmin } from "./auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MBL_DATABASE: Record<string, Record<string, { dia: number; mbl: number }[]>> = {
  gegalvaniseerd: {
    "1x7": [
      { dia: 1, mbl: 98 }, { dia: 2, mbl: 393 }, { dia: 2.5, mbl: 614 }, { dia: 3, mbl: 884 },
      { dia: 3.5, mbl: 1204 }, { dia: 4, mbl: 1571 }, { dia: 4.5, mbl: 1989 }, { dia: 5, mbl: 2458 }, { dia: 6, mbl: 3539 },
    ],
    "1x19": [
      { dia: 1, mbl: 95 }, { dia: 1.25, mbl: 148 }, { dia: 1.5, mbl: 213 }, { dia: 2, mbl: 379 },
      { dia: 2.5, mbl: 593 }, { dia: 3, mbl: 854 }, { dia: 3.5, mbl: 1162 }, { dia: 4, mbl: 1518 },
      { dia: 4.5, mbl: 1921 }, { dia: 5, mbl: 2366 }, { dia: 6, mbl: 3417 },
    ],
    "7x7": [
      { dia: 1, mbl: 60 }, { dia: 1.5, mbl: 135 }, { dia: 1.8, mbl: 194 }, { dia: 2, mbl: 240 },
      { dia: 2.5, mbl: 375 }, { dia: 3, mbl: 540 }, { dia: 4, mbl: 960 }, { dia: 5, mbl: 1499 },
      { dia: 6, mbl: 2152 }, { dia: 7, mbl: 2938 }, { dia: 8, mbl: 3835 }, { dia: 9, mbl: 4855 },
      { dia: 10, mbl: 5998 }, { dia: 11, mbl: 7252 }, { dia: 12, mbl: 8639 }, { dia: 13, mbl: 10139 },
      { dia: 14, mbl: 11730 }, { dia: 16, mbl: 15402 }, { dia: 18, mbl: 19482 }, { dia: 20, mbl: 23970 },
    ],
    "6x19": [
      { dia: 2.5, mbl: 373 }, { dia: 3, mbl: 500 }, { dia: 4, mbl: 887 }, { dia: 5, mbl: 1387 },
      { dia: 6, mbl: 1999 }, { dia: 7, mbl: 2723 }, { dia: 8, mbl: 3550 }, { dia: 9, mbl: 4498 },
      { dia: 10, mbl: 5549 }, { dia: 11, mbl: 6712 }, { dia: 12, mbl: 7987 }, { dia: 13, mbl: 9374 },
      { dia: 14, mbl: 10914 }, { dia: 16, mbl: 14178 }, { dia: 18, mbl: 17952 }, { dia: 20, mbl: 22236 },
      { dia: 22, mbl: 26826 }, { dia: 24, mbl: 31926 },
    ],
    "6x36": [
      { dia: 8, mbl: 3815 }, { dia: 9, mbl: 4825 }, { dia: 10, mbl: 5960 }, { dia: 11, mbl: 7210 },
      { dia: 12, mbl: 8580 }, { dia: 13, mbl: 10100 }, { dia: 14, mbl: 11600 }, { dia: 15, mbl: 13400 },
      { dia: 16, mbl: 15300 }, { dia: 18, mbl: 19300 }, { dia: 19, mbl: 21500 }, { dia: 20, mbl: 23900 },
      { dia: 22, mbl: 28900 }, { dia: 24, mbl: 34300 }, { dia: 26, mbl: 40300 }, { dia: 28, mbl: 46700 },
      { dia: 30, mbl: 53600 }, { dia: 32, mbl: 61000 }, { dia: 34, mbl: 68800 }, { dia: 36, mbl: 77200 },
      { dia: 38, mbl: 86000 }, { dia: 40, mbl: 95300 }, { dia: 44, mbl: 115000 }, { dia: 48, mbl: 138000 },
      { dia: 52, mbl: 161000 },
    ],
    "6x37": [
      { dia: 6, mbl: 1918 }, { dia: 7, mbl: 2611 }, { dia: 8, mbl: 3407 }, { dia: 9, mbl: 4315 },
      { dia: 10, mbl: 5324 }, { dia: 11, mbl: 6436 }, { dia: 12, mbl: 7660 }, { dia: 13, mbl: 8996 },
      { dia: 14, mbl: 10404 }, { dia: 16, mbl: 13668 }, { dia: 18, mbl: 17238 }, { dia: 20, mbl: 21318 },
      { dia: 22, mbl: 25806 }, { dia: 24, mbl: 30702 }, { dia: 26, mbl: 36006 }, { dia: 28, mbl: 41718 },
      { dia: 30, mbl: 47940 }, { dia: 32, mbl: 54468 }, { dia: 36, mbl: 68952 }, { dia: 40, mbl: 85170 },
      { dia: 44, mbl: 103020 }, { dia: 48, mbl: 122400 }, { dia: 52, mbl: 143820 }, { dia: 56, mbl: 167280 },
    ],
  },
  rvs: {
    "1x19": [
      { dia: 1, mbl: 84 }, { dia: 1.2, mbl: 128 }, { dia: 1.5, mbl: 190 }, { dia: 2, mbl: 337 },
      { dia: 2.5, mbl: 525 }, { dia: 3, mbl: 757 }, { dia: 3.5, mbl: 1030 }, { dia: 4, mbl: 1346 },
      { dia: 5, mbl: 2101 }, { dia: 6, mbl: 3029 }, { dia: 7, mbl: 4284 }, { dia: 8, mbl: 5303 }, { dia: 10, mbl: 8405 },
    ],
    "7x7": [
      { dia: 0.45, mbl: 12 }, { dia: 0.54, mbl: 17 }, { dia: 0.63, mbl: 23 }, { dia: 0.81, mbl: 38 },
      { dia: 0.9, mbl: 47 }, { dia: 1, mbl: 57 }, { dia: 1.2, mbl: 83 }, { dia: 1.5, mbl: 129 },
      { dia: 1.8, mbl: 187 }, { dia: 2, mbl: 230 }, { dia: 2.5, mbl: 359 }, { dia: 3, mbl: 518 },
      { dia: 4, mbl: 920 }, { dia: 5, mbl: 1438 }, { dia: 6, mbl: 2071 }, { dia: 7, mbl: 2820 },
      { dia: 8, mbl: 3682 }, { dia: 10, mbl: 5702 }, { dia: 12, mbl: 8272 },
    ],
    "7x19": [
      { dia: 0.75, mbl: 30 }, { dia: 1, mbl: 59 }, { dia: 1.5, mbl: 120 }, { dia: 2, mbl: 212 },
      { dia: 2.5, mbl: 333 }, { dia: 3, mbl: 478 }, { dia: 4, mbl: 851 }, { dia: 5, mbl: 1328 },
      { dia: 6, mbl: 1913 }, { dia: 7, mbl: 2603 }, { dia: 8, mbl: 3397 }, { dia: 9, mbl: 4304 },
      { dia: 10, mbl: 5314 }, { dia: 12, mbl: 7650 }, { dia: 14, mbl: 10404 }, { dia: 16, mbl: 13566 },
    ],
  },
};

const MBL_TABLE_VALBEVEILIGING = MBL_DATABASE.rvs["7x7"].filter(e => e.dia >= 1 && e.dia <= 3);

function lookupMBL(materiaal: string, constructie: string, diameter: number): { exact: boolean; mbl: number; dia: number } | null {
  const mat = materiaal === "staal" ? "gegalvaniseerd" : materiaal;
  const table = MBL_DATABASE[mat]?.[constructie];
  if (!table || table.length === 0) return null;

  const exact = table.find(e => Math.abs(e.dia - diameter) < 0.001);
  if (exact) return { exact: true, mbl: exact.mbl, dia: exact.dia };

  if (diameter < table[0].dia || diameter > table[table.length - 1].dia) return null;

  let lower = table[0], upper = table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].dia <= diameter && table[i + 1].dia >= diameter) {
      lower = table[i];
      upper = table[i + 1];
      break;
    }
  }

  const ratio = (diameter - lower.dia) / (upper.dia - lower.dia);
  const interpolated = Math.round(lower.mbl + ratio * (upper.mbl - lower.mbl));
  return { exact: false, mbl: interpolated, dia: diameter };
}

function calculateBreekkracht(params: { diameter: number; materiaal: string; constructie: string }) {
  const { diameter, materiaal, constructie } = params;
  const mat = materiaal === "staal" ? "gegalvaniseerd" : materiaal;

  const lookup = lookupMBL(mat, constructie, diameter);

  if (!lookup) {
    const table = MBL_DATABASE[mat]?.[constructie];
    if (!table) {
      return {
        results: [{ label: "Fout", value: `Geen data beschikbaar voor ${mat} ${constructie}`, unit: "" }],
        formula: "",
        advice: `De combinatie ${mat} + ${constructie} is niet beschikbaar in onze database. Kies een andere combinatie of neem contact op met ons technisch team.`,
        warning: "Combinatie niet beschikbaar in MBL-database.",
      };
    }
    const minDia = table[0].dia;
    const maxDia = table[table.length - 1].dia;
    return {
      results: [
        { label: "Diameter", value: String(diameter), unit: "mm" },
        { label: "Fout", value: `Buiten bereik (${minDia}–${maxDia} mm)`, unit: "" },
      ],
      formula: "",
      advice: `Diameter ${diameter} mm valt buiten het beschikbare bereik van ${minDia}–${maxDia} mm voor ${constructie} ${mat}. Kies een diameter binnen dit bereik of neem contact op voor maatwerk.`,
      warning: `Beschikbaar bereik: ${minDia}–${maxDia} mm.`,
    };
  }

  const mblKN = (lookup.mbl * 9.81) / 1000;
  const matLabel = mat === "rvs" ? "RVS (roestvrij staal)" : "Gegalvaniseerd staal";
  const normLabel = mat === "rvs" ? "1570 N/mm²" : "1770 N/mm²";

  const results = [
    { label: "Diameter", value: String(diameter), unit: "mm" },
    { label: "Materiaal", value: matLabel, unit: "" },
    { label: "Constructie", value: constructie, unit: "" },
    { label: "Treksterkte", value: normLabel, unit: "" },
    { label: "Breekkracht (MBL)", value: String(lookup.mbl), unit: "kg" },
    { label: "Breekkracht (MBL)", value: mblKN.toFixed(2), unit: "kN" },
  ];

  const formulaSteps = [
    `Bron: Velda MBL-tabel (conform EN 12385 / DIN 3055–3068)`,
    `Materiaal: ${matLabel} (${normLabel})`,
    `Constructie: ${constructie}`,
    `Diameter: ${diameter} mm`,
    lookup.exact
      ? `MBL: ${lookup.mbl} kg (exacte waarde uit tabel)`
      : `MBL: ${lookup.mbl} kg (geïnterpoleerd tussen tabelwaarden)`,
    `MBL in kN: ${lookup.mbl} × 9,81 / 1000 = ${mblKN.toFixed(2)} kN`,
  ];

  let advice = `De minimale breekkracht (MBL) van een ${constructie} ${matLabel.toLowerCase()} kabel met diameter ${diameter} mm bedraagt ${lookup.mbl} kg (${mblKN.toFixed(2)} kN).`;
  if (!lookup.exact) {
    advice += `\n\nDeze waarde is geïnterpoleerd. Voor exacte waarden, kies een standaarddiameter uit het Velda-assortiment.`;
  }
  advice += `\n\nDe Safe Working Load (SWL) bedraagt, afhankelijk van de veiligheidsfactor (5:1 standaard), maximaal ${Math.round(lookup.mbl / 5)} kg.`;
  advice += `\n\nWaarden conform EN 12385 / ISO 2408. Raadpleeg Velda's technisch team voor toepassingsspecifiek advies.`;

  return { results, formula: formulaSteps.join("\n"), advice, warning: null };
}

function calculateValbeveiliging(params: { gewicht: number; kabellengte_mm: number }) {
  const gewicht = params.gewicht;
  const kabellengteMm = params.kabellengte_mm;
  const h = kabellengteMm / 1000;
  const delta = Math.max(0.015 * h, 0.002);
  const schokfactor = 1 + Math.sqrt(1 + (2 * h) / delta);
  const fDyn = gewicht * schokfactor;
  const benodigdeMBL = fDyn * 5;

  let gekozenKabel = MBL_TABLE_VALBEVEILIGING.find(k => k.mbl >= benodigdeMBL);
  let breekkracht = gekozenKabel ? gekozenKabel.mbl : null;
  let diameter = gekozenKabel ? gekozenKabel.dia : null;

  const results = [
    { label: "Gewicht", value: String(gewicht), unit: "kg" },
    { label: "Kabellengte", value: String(kabellengteMm), unit: "mm" },
    { label: "Valdistantie", value: h.toFixed(2), unit: "m" },
    { label: "Schokfactor", value: schokfactor.toFixed(1), unit: "" },
    { label: "Dynamische kracht", value: fDyn.toFixed(1), unit: "kg" },
    { label: "Benodigde MBL", value: benodigdeMBL.toFixed(1), unit: "kg" },
    { label: "Breekkracht gekozen kabel", value: breekkracht ? String(breekkracht) : "n.v.t.", unit: breekkracht ? "kg" : "" },
    { label: "Aanbevolen diameter", value: diameter ? String(diameter) : "Raadpleeg specialist", unit: diameter ? "mm" : "" },
  ];

  const formulaSteps = [
    `Stap 1: h = ${kabellengteMm} / 1000 = ${h} m`,
    `Stap 2: δ = max(0,015 × ${h}, 0,002) = ${delta.toFixed(4)} m`,
    `Stap 3: Schokfactor = 1 + √(1 + 2 × ${h} / ${delta.toFixed(4)}) = 1 + √(${(1 + (2 * h) / delta).toFixed(2)}) = ${schokfactor.toFixed(2)}`,
    `Stap 4: F_dyn = ${gewicht} × ${schokfactor.toFixed(2)} = ${fDyn.toFixed(1)} kg`,
    `Stap 5: Benodigde MBL = ${fDyn.toFixed(1)} × 5 = ${benodigdeMBL.toFixed(1)} kg`,
  ];

  if (gekozenKabel) {
    formulaSteps.push(`Stap 6: Kies kabel: ${diameter} mm (MBL ${breekkracht} kg) voldoet.`);
  } else {
    formulaSteps.push(`Stap 6: Geen standaardkabel voldoet (max beschikbaar: 3,0 mm / MBL 700 kg).`);
  }

  let advice = `De veiligheidskabel vangt het object op na een val over ${h} m. Door de dynamische schokbelasting is de kracht op de kabel ${schokfactor.toFixed(1)}× hoger dan het statische gewicht.`;
  if (gekozenKabel) {
    advice += `\n\nAanbeveling: RVS 7×7 staalkabel, diameter ${diameter} mm (MBL ${breekkracht} kg, veiligheidsfactor ${(breekkracht! / fDyn).toFixed(1)}:1).`;
    advice += `\nConstructie: 7×7 RVS 316 — standaard voor objectbeveiliging.`;
  } else {
    advice += `\n\nGeen enkele standaardkabel uit het Velda-assortiment (max 3,0 mm / MBL 700 kg) voldoet aan de benodigde MBL van ${benodigdeMBL.toFixed(0)} kg.`;
    advice += `\nAanbevelingen:\n• Gebruik meerdere veiligheidskabels (verdeel de belasting)\n• Verkort de kabellengte (minder slack = lagere schokbelasting)\n• Neem contact op met Velda's technisch team voor een maatwerkoplossing`;
  }
  advice += `\n\nBelangrijk: Laat kritische valbeveiligingen altijd berekenen en installeren door een gecertificeerd specialist.`;

  let warning = null;
  if (!gekozenKabel) {
    warning = "De benodigde MBL overschrijdt het standaard kabelassortiment. Raadpleeg Velda's technisch team voor een maatwerkoplossing met meerdere kabels of een zwaarder kabeltype.";
  }
  if (gewicht > 100) {
    warning = (warning ? warning + " " : "") + "Bij objecten zwaarder dan 100 kg wordt een professionele valbeveiligingsanalyse door een gecertificeerd ingenieur sterk aanbevolen.";
  }

  return { results, formula: formulaSteps.join("\n"), advice, warning };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/products", async (req, res) => {
    try {
      const { type, category, search } = req.query;
      const products = await storage.getProducts({
        type: type as string | undefined,
        category: category as string | undefined,
        search: search as string | undefined,
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen producten" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product niet gevonden" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen product" });
    }
  });

  app.get("/api/sectors", async (_req, res) => {
    try {
      const sectorsList = await storage.getSectors();
      res.json(sectorsList);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen sectoren" });
    }
  });

  app.get("/api/sectors/:slug", async (req, res) => {
    try {
      const sector = await storage.getSectorBySlug(req.params.slug);
      if (!sector) {
        return res.status(404).json({ message: "Sector niet gevonden" });
      }
      res.json(sector);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen sector" });
    }
  });

  app.get("/api/sectors/:slug/products", async (req, res) => {
    try {
      const sector = await storage.getSectorBySlug(req.params.slug);
      if (!sector) {
        return res.status(404).json({ message: "Sector niet gevonden" });
      }
      const keywords = sector.keywords || [];
      if (keywords.length === 0) {
        return res.json([]);
      }
      const allProducts = await storage.getProducts();
      const matched = allProducts.filter((p) => {
        const name = p.name.toLowerCase();
        const desc = (p.descriptionShort || "").toLowerCase();
        const cat = p.category.toLowerCase();
        const slug = p.slug.toLowerCase();
        return keywords.some((kw) => {
          const k = kw.toLowerCase();
          return name.includes(k) || desc.includes(k) || cat.includes(k) || slug.includes(k);
        });
      });
      res.json(matched);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen sector producten" });
    }
  });

  app.get("/api/timeline", async (_req, res) => {
    try {
      const events = await storage.getTimelineEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen tijdlijn" });
    }
  });

  app.post("/api/quote-requests", async (req, res) => {
    try {
      const parsed = insertQuoteRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      }
      const quoteRequest = await storage.createQuoteRequest(parsed.data);
      res.status(201).json(quoteRequest);
    } catch (error) {
      res.status(500).json({ message: "Fout bij aanmaken offerteaanvraag" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      }
      const message = await storage.createContactMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Fout bij verzenden bericht" });
    }
  });

  app.post("/api/ai-quote-chat", async (req, res) => {
    try {
      const { messages: chatMessages } = req.body;
      if (!chatMessages || !Array.isArray(chatMessages)) {
        return res.status(400).json({ message: "Berichten vereist" });
      }

      const products = await storage.getProducts();
      const productSummary = products.map(p => {
        const specs = (p.specs || {}) as Record<string, string>;
        return `- ${p.name} (${p.type}, ${p.category}): ${p.descriptionShort}. Specs: ${Object.entries(specs).map(([k,v]) => `${k}: ${v}`).join(', ')}`;
      }).join('\n');

      const systemPrompt = `Je bent de Offerte Intake Assistent van Velda Cable Technics, een Belgisch bedrijf gespecialiseerd in staalkabels sinds 1935. Je communiceert ALTIJD in het Nederlands.

Je helpt klanten bij het selecteren van de juiste staalkabel en eindafwerkingen voor hun toepassing, en genereert een gestructureerde offerteaanvraag.

BESCHIKBARE PRODUCTEN:
${productSummary}

BELANGRIJKE REGELS:
- QS producten: ALLEEN voor droge binnenomgevingen; NOOIT voor hijstoepassingen; NOOIT meer dan 60° hoek; werkbelasting verandert bij hoek.
- Gebruik altijd veiligheidsfactoren en geef conservatieve aanbevelingen (1:5 ratio).
- Stel verduidelijkingsvragen totdat je genoeg informatie hebt.
- Vraag altijd naar: toepassing, omgeving (binnen/buiten, droog/nat), belasting (kg), kabellengte, gewenste eindafwerkingen.

WANNEER JE GENOEG INFORMATIE HEBT, geef dan:
1. Aanbevolen kabeltype en diameter (met redenering)
2. Voorgestelde afwerkingen/componenten
3. Waarschuwingen en aannames
4. Een overzicht in stijl van een stuklijst

Wees professioneel, behulpzaam en technisch nauwkeurig. Gebruik eenvoudig Nederlands.`;

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
        stream: true,
        max_tokens: 2048,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI quote chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "AI fout" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ message: "Fout bij AI assistent" });
      }
    }
  });

  app.post("/api/ai-product-chat", async (req, res) => {
    try {
      const { messages: chatMessages, productSlug } = req.body;
      if (!chatMessages || !Array.isArray(chatMessages)) {
        return res.status(400).json({ message: "Berichten vereist" });
      }

      let productContext = "";
      if (productSlug) {
        const product = await storage.getProductBySlug(productSlug);
        if (product) {
          const specs = (product.specs || {}) as Record<string, string>;
          const specsText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join('\n  ');
          productContext = `
HUIDIG PRODUCT (waar de klant naar kijkt):
- Naam: ${product.name}
- Type: ${product.type}
- Categorie: ${product.category}
- Korte beschrijving: ${product.descriptionShort || 'N/A'}
- Lange beschrijving: ${product.descriptionLong || 'N/A'}
- Tags: ${(product.tags || []).join(', ')}
- Specificaties:
  ${specsText}
`;
        }
      }

      const allProducts = await storage.getProducts();
      const otherProducts = allProducts.filter(p => p.slug !== productSlug);
      const alternativesSummary = otherProducts.map(p => `- ${p.name} (${p.type}, ${p.category}): ${p.descriptionShort}`).join('\n');

      const systemPrompt = `Je bent de Product Advies Assistent van Velda Cable Technics, een Belgisch bedrijf gespecialiseerd in staalkabels sinds 1935. Je communiceert ALTIJD in het Nederlands.

Je helpt klanten met vragen over het specifieke product dat ze bekijken, inclusief technische specificaties, toepassingen, installatie-advies en alternatieven.

${productContext}

ANDERE BESCHIKBARE PRODUCTEN (voor alternatieven/suggesties):
${alternativesSummary}

BELANGRIJKE REGELS:
- Focus op het huidige product en beantwoord vragen specifiek over dit product.
- Bij vragen over alternatieven, verwijs naar andere producten in het assortiment.
- QS producten: ALLEEN voor droge binnenomgevingen; NOOIT voor hijstoepassingen; NOOIT meer dan 60° hoek.
- Geef altijd veilige, conservatieve aanbevelingen.
- Wees beknopt maar grondig. Gebruik eenvoudig Nederlands.
- Als de klant een offerte wil, verwijs naar het offerteformulier op de website.`;

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
        stream: true,
        max_tokens: 1024,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI product chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "AI fout" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ message: "Fout bij AI assistent" });
      }
    }
  });

  app.get("/api/jobs", async (_req, res) => {
    try {
      const jobsList = await storage.getJobs();
      res.json(jobsList);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen vacatures" });
    }
  });

  app.get("/api/jobs/:slug", async (req, res) => {
    try {
      const job = await storage.getJobBySlug(req.params.slug);
      if (!job) {
        return res.status(404).json({ message: "Vacature niet gevonden" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen vacature" });
    }
  });

  app.post("/api/job-applications", async (req, res) => {
    try {
      const parsed = insertJobApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      }
      const application = await storage.createJobApplication(parsed.data);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: "Fout bij indienen sollicitatie" });
    }
  });

  app.post("/api/catalog-downloads", async (req, res) => {
    try {
      const parsed = insertCatalogDownloadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      }
      const download = await storage.createCatalogDownload(parsed.data);
      res.status(201).json(download);
    } catch (error) {
      res.status(500).json({ message: "Fout bij registreren download" });
    }
  });

  app.post("/api/cable-calculator", async (req, res) => {
    try {
      const { calculationType, parameters } = req.body;
      if (!calculationType || !parameters) {
        return res.status(400).json({ message: "Berekeningstype en parameters vereist" });
      }

      if (calculationType === "valbeveiliging") {
        const result = calculateValbeveiliging(parameters);
        return res.json(result);
      }

      if (calculationType === "breekkracht") {
        const result = calculateBreekkracht(parameters);
        return res.json(result);
      }

      const systemPrompt = `Je bent een technische kabelberekenings-expert van Velda Cable Technics, een Belgisch bedrijf gespecialiseerd in staalkabels sinds 1935.

Je BEREKENT nauwkeurig en geeft professioneel technisch advies over staalkabels, gebaseerd op industriële normen (EN 12385, EN 795, ISO 2408) en exacte wiskundige formules.

EXACTE FORMULES — GEBRUIK DEZE ALTIJD:

1. BREEKKRACHT:
   Breekkracht_kg = F × D² × C
   Breekkracht_kN = Breekkracht_kg × 9.81 / 1000
   Waarbij:
   - D = kabeldiameter in mm
   - F = materiaalfactor: Staal = 45, RVS = 50, Gegalvaniseerd = 42
   - C = constructiefactor: 1×19 = 1.0, 7×7 = 0.85, 7×19 = 0.75

2. SWL (Safe Working Load):
   Vanuit diameter: SWL = Breekkracht_kg / veiligheidsfactor
     (bereken eerst Breekkracht_kg via formule 1 met de opgegeven diameter)
   Vanuit breekkracht: SWL = breekkracht_kg / veiligheidsfactor
   Veiligheidsfactoren: statisch = 5, extra = 10

3. KABELDIAMETER:
   De benodigde breekkracht = belasting_kg × veiligheidsfactor
   Veiligheidsfactoren: statisch = 5, extra = 10
   
   VELDA MBL REFERENTIETABEL — GEBRUIK ALTIJD DEZE TABEL, NIET DE FORMULE:
   RVS 7×7 (standaard voor ophangingen):
   - 1,0 mm: MBL 60 kg → SWL 5:1 = 12 kg
   - 1,5 mm: MBL 180 kg → SWL 5:1 = 36 kg
   - 2,0 mm: MBL 310 kg → SWL 5:1 = 62 kg
   - 2,5 mm: MBL 480 kg → SWL 5:1 = 96 kg
   - 3,0 mm: MBL 700 kg → SWL 5:1 = 140 kg
   
   RVS 7×19 (flexibeler, voor dynamische toepassingen):
   - 0,75 mm: MBL 30 kg → SWL 5:1 = 6 kg
   - 1,0 mm: MBL 59 kg → SWL 5:1 = 12 kg
   - 1,5 mm: MBL 120 kg → SWL 5:1 = 24 kg
   - 2,0 mm: MBL 212 kg → SWL 5:1 = 42 kg
   - 2,5 mm: MBL 333 kg → SWL 5:1 = 67 kg
   - 3,0 mm: MBL 478 kg → SWL 5:1 = 96 kg
   - 4,0 mm: MBL 851 kg → SWL 5:1 = 170 kg
   - 5,0 mm: MBL 1328 kg → SWL 5:1 = 266 kg
   - 6,0 mm: MBL 1913 kg → SWL 5:1 = 383 kg
   
   RVS 1×19 (maximale stijfheid):
   - 1,0 mm: MBL 95 kg → SWL 5:1 = 19 kg
   - 1,5 mm: MBL 213 kg → SWL 5:1 = 43 kg
   - 2,0 mm: MBL 379 kg → SWL 5:1 = 76 kg
   - 2,5 mm: MBL 593 kg → SWL 5:1 = 119 kg
   - 3,0 mm: MBL 854 kg → SWL 5:1 = 171 kg
   
   WERKWIJZE:
   1. Bereken benodigde breekkracht = belasting × veiligheidsfactor
   2. Kies standaard RVS 7×7 constructie
   3. Zoek in de tabel de kleinste diameter waarvan de MBL ≥ benodigde breekkracht
   4. Dat is de aanbevolen diameter
   
   Voorbeeld: 30 kg met 5:1 → benodigde breekkracht = 150 kg → 1,5 mm (MBL 180 kg) volstaat.
   Voorbeeld: 40 kg met 5:1 → benodigde breekkracht = 200 kg → 2,0 mm (MBL 310 kg) volstaat.

4. VALBEVEILIGINGSKABEL (objectbeveiliging met staalkabel):
   Parameters: gewicht (kg), kabellengte_mm (mm)
   
   CONTEXT: De veiligheidskabel hangt gebogen (met slack) onder een object (bv. verlichtingsarmatuur, bord, luidsprekerbox) als secundaire beveiliging. Bij breuk van de primaire ophanging valt het object over de kabellengte (= valdistantie) totdat de kabel strak trekt en het object opvangt. Dit veroorzaakt een dynamische schokbelasting die VEEL hoger is dan het statische gewicht.
   
   BEREKENING — DYNAMISCHE SCHOKBELASTING:
   De kabellengte is de valdistantie (h). Bij het opvangen rekt de staalkabel elastisch uit (δ). De schokbelasting wordt berekend met de energiebalans-methode:
   
   Stap 1: Valdistantie h = kabellengte_mm / 1000 (in meter)
   Stap 2: Elastische rek staalkabel δ = 0,015 × h (1,5% voor RVS 7×7 staalkabel). Minimum δ = 0,002 m (2 mm) om deling door nul te voorkomen.
   Stap 3: Schokfactor = 1 + √(1 + 2×h/δ)
   Stap 4: Dynamische kracht F_dyn = gewicht × 9,81 × schokfactor (in Newton), deel door 9,81 voor kg-equivalent
   Stap 5: Benodigde MBL = F_dyn (in kg) × veiligheidsfactor 5
   Stap 6: Kies de kleinste kabel uit de Velda referentietabel waarvan de MBL ≥ benodigde MBL
   
   VELDA MBL REFERENTIETABEL (RVS 7×7):
   - 1,0 mm: MBL 60 kg
   - 1,5 mm: MBL 180 kg
   - 2,0 mm: MBL 310 kg
   - 2,5 mm: MBL 480 kg
   - 3,0 mm: MBL 700 kg
   
   REKENVOORBEELDEN (controleer je berekening hiermee):
   - 3 kg, 200 mm kabel: h=0,2m, δ=max(0,015×0,2, 0,002)=0,003m, schokfactor=1+√(1+2×0,2/0,003)=1+√(134,3)=1+11,59=12,59, F_dyn=3×12,59=37,8 kg, benodigde MBL=37,8×5=189 kg → 2,0 mm kabel (MBL 310 kg)
   - 50 kg, 700 mm kabel: h=0,7m, δ=max(0,015×0,7, 0,002)=0,0105m, schokfactor=1+√(1+2×0,7/0,0105)=1+√(134,3)=1+11,59=12,59, F_dyn=50×12,59=629,6 kg, benodigde MBL=629,6×5=3148 kg → GEEN standaardkabel voldoet. Adviseer meerdere kabels of dikkere kabel buiten standaardassortiment.
   
   TOON ALTIJD in results: gewicht (kg), kabellengte (mm), valdistantie (m), schokfactor (afgerond op 1 decimaal), dynamische kracht (kg, afgerond), benodigde MBL (kg), breekkracht gekozen kabel (kg, of "n.v.t." als geen kabel voldoet), en aanbevolen diameter (mm, of "Raadpleeg specialist").
   Constructie: 7×7 RVS 316.
   
   BELANGRIJK voor advice:
   - Leg uit dat de kabellengte de valdistantie is en dat de dynamische kracht door de val veel hoger is dan het statische gewicht
   - Als geen kabel uit het assortiment voldoet: adviseer meervoudige ophanging, kortere kabellengte (minder slack), of raadpleging van Velda's technisch team
   - Hoe korter de kabel (minder slack), hoe kleiner de valdistantie en hoe lager de schokbelasting
   - Vermeld altijd: laat kritische valbeveiligingen berekenen en installeren door een gecertificeerd specialist

CONSTRUCTIETYPES:
- 1×19: Maximale stijfheid, minimale rek. Voor balustrades en spandraden.
- 7×7: Goede balans flexibiliteit/sterkte. Meest gebruikt voor ophangingssystemen.
- 7×19: Maximale flexibiliteit. Voor dynamische toepassingen en valbeveiliging.

ANTWOORDFORMAAT:
Je antwoord MOET exact dit JSON-formaat volgen (geen markdown, geen codeblokken, puur JSON):
{
  "results": [
    {"label": "Naam van waarde", "value": "numerieke waarde", "unit": "eenheid"}
  ],
  "formula": "Gebruikte formule als tekst",
  "advice": "Gedetailleerd technisch advies in het Nederlands met normen, aanbevelingen en waarschuwingen. Gebruik \\n voor nieuwe regels.",
  "warning": "Optionele waarschuwing (of null)"
}

REGELS:
- Bereken ALTIJD exact met de bovenstaande formules — rond correct af
- Geef altijd conservatieve aanbevelingen
- Vermeld altijd relevante normen (EN 12385, EN 795, ISO 2408)
- Waarschuw bij kritische toepassingen (personenvervoer, valbeveiliging)
- Adviseer raadpleging van een gecertificeerd ingenieur voor kritische toepassingen
- Antwoord ALTIJD in het Nederlands
- Retourneer ALLEEN geldig JSON, geen markdown of extra tekst`;

      const userMessage = `Berekeningstype: ${calculationType}
Parameters: ${JSON.stringify(parameters, null, 2)}

Bereken de exacte waarden en geef professioneel advies. Antwoord ALLEEN in JSON-formaat.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });

      const raw = response.choices[0]?.message?.content || "";
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      
      try {
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
      } catch {
        res.json({
          results: [],
          formula: "",
          advice: raw,
          warning: null,
        });
      }
    } catch (error) {
      console.error("Cable calculator error:", error);
      res.status(500).json({ message: "Fout bij berekening" });
    }
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const allProducts = await storage.getProducts();
      const allSectors = await storage.getSectors();
      const allJobs = await storage.getJobs();
      const baseUrl = "https://velda-cabletechnics.com";
      const today = new Date().toISOString().split("T")[0];

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/producten", priority: "0.9", changefreq: "weekly" },
        { loc: "/sectoren", priority: "0.8", changefreq: "monthly" },
        { loc: "/catalogen", priority: "0.8", changefreq: "monthly" },
        { loc: "/calculatietools", priority: "0.7", changefreq: "monthly" },
        { loc: "/jobs", priority: "0.7", changefreq: "weekly" },
        { loc: "/offerte", priority: "0.8", changefreq: "monthly" },
        { loc: "/over-ons", priority: "0.6", changefreq: "monthly" },
        { loc: "/contact", priority: "0.6", changefreq: "monthly" },
        { loc: "/algemene-voorwaarden", priority: "0.3", changefreq: "yearly" },
        { loc: "/privacy-beleid", priority: "0.3", changefreq: "yearly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${baseUrl}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }

      for (const product of allProducts) {
        xml += `  <url>\n    <loc>${baseUrl}/producten/${product.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      for (const sector of allSectors) {
        xml += `  <url>\n    <loc>${baseUrl}/sectoren/${sector.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;

      res.setHeader("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://velda-cabletechnics.com/sitemap.xml`;
    res.setHeader("Content-Type", "text/plain");
    res.send(robotsTxt);
  });

  // ========== ADMIN API ROUTES ==========

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const allProducts = await storage.getProducts();
      const allJobs = await storage.getJobs(true);
      const activeJobs = allJobs.filter(j => j.active);
      const allQuotes = await storage.getQuoteRequests();
      const newQuotes = allQuotes.filter(q => q.status === "new");
      const allMessages = await storage.getContactMessages();
      const allDownloads = await storage.getCatalogDownloads();
      const allApplications = await storage.getJobApplications();
      const now = new Date();
      const thisMonth = allDownloads.filter(d => {
        const created = new Date(d.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      });
      res.json({
        products: allProducts.length,
        activeJobs: activeJobs.length,
        totalJobs: allJobs.length,
        newQuotes: newQuotes.length,
        totalQuotes: allQuotes.length,
        messages: allMessages.length,
        downloads: allDownloads.length,
        downloadsThisMonth: thisMonth.length,
        applications: allApplications.length,
        recentMessages: allMessages.slice(0, 5),
        recentQuotes: allQuotes.slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen statistieken" });
    }
  });

  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const { category, search } = req.query;
      const prods = await storage.getProducts({ category: category as string, search: search as string });
      res.json(prods);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen producten" });
    }
  });

  app.get("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const product = await storage.getProductById(parseInt(req.params.id));
      if (!product) return res.status(404).json({ message: "Product niet gevonden" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen product" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Fout bij aanmaken product" });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Product niet gevonden" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Fout bij bewerken product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Product niet gevonden" });
      res.json({ message: "Product verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Fout bij verwijderen product" });
    }
  });

  app.get("/api/admin/jobs", requireAdmin, async (_req, res) => {
    try {
      const jobsList = await storage.getJobs(true);
      res.json(jobsList);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen vacatures" });
    }
  });

  app.get("/api/admin/jobs/:id", requireAdmin, async (req, res) => {
    try {
      const job = await storage.getJobById(parseInt(req.params.id));
      if (!job) return res.status(404).json({ message: "Vacature niet gevonden" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen vacature" });
    }
  });

  app.post("/api/admin/jobs", requireAdmin, async (req, res) => {
    try {
      const parsed = insertJobSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      const job = await storage.createJob(parsed.data);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: "Fout bij aanmaken vacature" });
    }
  });

  app.put("/api/admin/jobs/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateJob(parseInt(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Vacature niet gevonden" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Fout bij bewerken vacature" });
    }
  });

  app.delete("/api/admin/jobs/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteJob(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Vacature niet gevonden" });
      res.json({ message: "Vacature verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Fout bij verwijderen vacature" });
    }
  });

  app.get("/api/admin/job-applications", requireAdmin, async (req, res) => {
    try {
      const { jobSlug } = req.query;
      const apps = await storage.getJobApplications(jobSlug as string);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen sollicitaties" });
    }
  });

  app.delete("/api/admin/job-applications/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteJobApplication(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Sollicitatie niet gevonden" });
      res.json({ message: "Sollicitatie verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Fout bij verwijderen sollicitatie" });
    }
  });

  app.get("/api/admin/contact-messages", requireAdmin, async (_req, res) => {
    try {
      const msgs = await storage.getContactMessages();
      res.json(msgs);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen berichten" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteContactMessage(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Bericht niet gevonden" });
      res.json({ message: "Bericht verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Fout bij verwijderen bericht" });
    }
  });

  app.get("/api/admin/quote-requests", requireAdmin, async (_req, res) => {
    try {
      const quotes = await storage.getQuoteRequests();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen offertes" });
    }
  });

  app.get("/api/admin/quote-requests/:id", requireAdmin, async (req, res) => {
    try {
      const qr = await storage.getQuoteRequestById(parseInt(req.params.id));
      if (!qr) return res.status(404).json({ message: "Offerte niet gevonden" });
      res.json(qr);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen offerte" });
    }
  });

  app.patch("/api/admin/quote-requests/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["new", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Ongeldige status" });
      }
      const updated = await storage.updateQuoteRequestStatus(parseInt(req.params.id), status);
      if (!updated) return res.status(404).json({ message: "Offerte niet gevonden" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Fout bij updaten status" });
    }
  });

  app.delete("/api/admin/quote-requests/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteQuoteRequest(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Offerte niet gevonden" });
      res.json({ message: "Offerte verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Fout bij verwijderen offerte" });
    }
  });

  app.get("/api/admin/sectors", requireAdmin, async (_req, res) => {
    try {
      const sectorsList = await storage.getSectors();
      res.json(sectorsList);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen sectoren" });
    }
  });

  app.get("/api/admin/sectors/:id", requireAdmin, async (req, res) => {
    try {
      const allSectors = await storage.getSectors();
      const sector = allSectors.find(s => s.id === parseInt(req.params.id));
      if (!sector) return res.status(404).json({ message: "Sector niet gevonden" });
      res.json(sector);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen sector" });
    }
  });

  app.post("/api/admin/sectors", requireAdmin, async (req, res) => {
    try {
      const parsed = insertSectorSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Ongeldige gegevens", errors: parsed.error.flatten() });
      const sector = await storage.createSector(parsed.data);
      res.status(201).json(sector);
    } catch (error) {
      res.status(500).json({ message: "Fout bij aanmaken sector" });
    }
  });

  app.put("/api/admin/sectors/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSector(parseInt(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Sector niet gevonden" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Fout bij bewerken sector" });
    }
  });

  app.delete("/api/admin/sectors/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSector(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Sector niet gevonden" });
      res.json({ message: "Sector verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Fout bij verwijderen sector" });
    }
  });

  app.get("/api/admin/catalog-downloads", requireAdmin, async (_req, res) => {
    try {
      const downloads = await storage.getCatalogDownloads();
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ message: "Fout bij ophalen downloads" });
    }
  });

  app.get("/api/admin/export/:type", requireAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      const format = (req.query.format as string) || "json";
      let data: any[] = [];
      let filename = "";

      switch (type) {
        case "products":
          data = await storage.getProducts();
          filename = "velda-producten";
          break;
        case "jobs":
          data = await storage.getJobs(true);
          filename = "velda-vacatures";
          break;
        case "contacts":
          data = await storage.getContactMessages();
          filename = "velda-contactberichten";
          break;
        case "quotes":
          data = await storage.getQuoteRequests();
          filename = "velda-offertes";
          break;
        case "downloads":
          data = await storage.getCatalogDownloads();
          filename = "velda-downloads";
          break;
        case "applications":
          data = await storage.getJobApplications();
          filename = "velda-sollicitaties";
          break;
        default:
          return res.status(400).json({ message: "Ongeldig exporttype" });
      }

      if (format === "csv") {
        if (data.length === 0) {
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
          return res.send("");
        }
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(","),
          ...data.map(row =>
            headers.map(h => {
              const val = (row as any)[h];
              const str = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
              return `"${str.replace(/"/g, '""')}"`;
            }).join(",")
          ),
        ];
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
        return res.send("\uFEFF" + csvRows.join("\n"));
      }

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.json"`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Fout bij exporteren" });
    }
  });

  app.get("/api/seed", async (_req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Niet beschikbaar in productie" });
    }
    try {
      await seedDatabase();
      res.json({ message: "Database gevuld!" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Fout bij vullen database" });
    }
  });

  return httpServer;
}
