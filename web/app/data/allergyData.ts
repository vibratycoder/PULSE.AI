/**
 * Allergy data bank — reference information for common allergies.
 *
 * Each entry includes a brief synopsis, what body systems it affects,
 * and practical avoidance strategies.
 */

export interface AllergyInfo {
  name: string;
  aliases: string[];
  synopsis: string;
  affects: string;
  avoidance: string;
}

const ALLERGY_DATA: AllergyInfo[] = [
  // ── Drug Allergies ──
  {
    name: "Penicillin",
    aliases: ["penicillin", "amoxicillin", "ampicillin"],
    synopsis:
      "An immune-mediated reaction to penicillin-class antibiotics. One of the most commonly reported drug allergies, though many people outgrow it over time.",
    affects:
      "Skin (hives, rash), respiratory system (wheezing, throat swelling), cardiovascular system (anaphylaxis in severe cases).",
    avoidance:
      "Inform all healthcare providers. Wear a medical alert bracelet. Avoid penicillin, amoxicillin, and ampicillin. Ask about cross-reactivity with cephalosporins. Request alternative antibiotics like azithromycin or fluoroquinolones.",
  },
  {
    name: "Sulfa Drugs",
    aliases: ["sulfa", "sulfonamide", "sulfamethoxazole", "bactrim"],
    synopsis:
      "A reaction to sulfonamide antibiotics used to treat bacterial infections and some other conditions. Distinct from sulfite or sulfur allergies.",
    affects:
      "Skin (rash, Stevens-Johnson syndrome in rare cases), liver, kidneys, blood cells.",
    avoidance:
      "Avoid sulfonamide antibiotics (e.g., Bactrim, sulfamethoxazole). Alert providers before any prescription. Note: sulfite and sulfur allergies are different and do not cross-react.",
  },
  {
    name: "Aspirin",
    aliases: ["aspirin", "asa", "acetylsalicylic acid"],
    synopsis:
      "A sensitivity to aspirin and often other NSAIDs (ibuprofen, naproxen). Can be a true allergy or a pseudoallergic reaction affecting the COX-1 enzyme pathway.",
    affects:
      "Respiratory system (asthma exacerbation, nasal polyps), skin (hives, angioedema), gastrointestinal tract.",
    avoidance:
      "Avoid aspirin and NSAIDs (ibuprofen, naproxen). Use acetaminophen (Tylenol) for pain relief if tolerated. Check OTC cold/flu medications for hidden aspirin. Discuss COX-2 inhibitors with your doctor if needed.",
  },
  {
    name: "Ibuprofen",
    aliases: ["ibuprofen", "advil", "motrin", "nsaid"],
    synopsis:
      "A reaction to ibuprofen or related NSAIDs. May indicate broader NSAID sensitivity affecting prostaglandin synthesis.",
    affects:
      "Skin (hives, swelling), respiratory system (bronchospasm), gastrointestinal tract, kidneys.",
    avoidance:
      "Avoid ibuprofen, naproxen, and other NSAIDs. Use acetaminophen as an alternative. Consult a doctor about which pain relievers are safe for you.",
  },

  // ── Food Allergies ──
  {
    name: "Peanuts",
    aliases: ["peanut", "peanuts", "groundnut"],
    synopsis:
      "One of the most common and potentially severe food allergies. The immune system reacts to proteins in peanuts. Even trace amounts can trigger a reaction.",
    affects:
      "Skin (hives, eczema), gastrointestinal tract (vomiting, cramps), respiratory system (wheezing, throat tightness), cardiovascular system (anaphylaxis).",
    avoidance:
      "Read all food labels for peanut warnings. Avoid foods processed in facilities that handle peanuts. Carry an epinephrine auto-injector (EpiPen) at all times. Alert restaurants and caregivers. Be cautious with Asian, African, and Mexican cuisines where peanuts are common.",
  },
  {
    name: "Tree Nuts",
    aliases: ["tree nuts", "almonds", "cashews", "walnuts", "pecans", "pistachios", "hazelnuts", "brazil nuts", "macadamia"],
    synopsis:
      "An allergy to one or more tree nuts. Having an allergy to one tree nut increases the risk of reacting to others, though cross-reactivity is not guaranteed.",
    affects:
      "Skin (hives, itching), mouth (oral allergy syndrome, tingling), gastrointestinal tract, respiratory system, cardiovascular system (anaphylaxis).",
    avoidance:
      "Read ingredient labels carefully. Avoid nut butters, nut oils, and nut flours. Be cautious with baked goods, cereals, and ice cream. Carry an EpiPen. Notify restaurants about your allergy.",
  },
  {
    name: "Shellfish",
    aliases: ["shellfish", "shrimp", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
    synopsis:
      "A reaction to proteins in crustaceans (shrimp, crab, lobster) and/or mollusks (clams, mussels, oysters). Crustacean allergy is more common and typically more severe.",
    affects:
      "Skin (hives, swelling), gastrointestinal tract (nausea, vomiting, diarrhea), respiratory system (wheezing), cardiovascular system (anaphylaxis).",
    avoidance:
      "Avoid all shellfish and dishes cooked in shared oil/surfaces. Check Asian sauces (oyster sauce, fish sauce). Be cautious with glucosamine supplements (often shellfish-derived). Alert restaurants; cross-contamination is common in seafood establishments.",
  },
  {
    name: "Fish",
    aliases: ["fish", "salmon", "tuna", "cod", "tilapia", "halibut"],
    synopsis:
      "An allergy to finned fish (distinct from shellfish allergy). The primary allergen is parvalbumin, a protein found in most fish species. Allergy to one species often means sensitivity to others.",
    affects:
      "Skin (hives, eczema), gastrointestinal tract (vomiting, diarrhea), respiratory system, cardiovascular system (anaphylaxis).",
    avoidance:
      "Avoid all finned fish unless specifically cleared by an allergist. Be cautious with Worcestershire sauce, Caesar dressing, and Asian fish sauces. Avoid seafood restaurants where airborne fish proteins may cause reactions.",
  },
  {
    name: "Milk",
    aliases: ["milk", "dairy", "cow's milk", "casein", "whey", "lactose"],
    synopsis:
      "An immune reaction to proteins in cow's milk (casein and whey). Different from lactose intolerance, which is a digestive issue. Most common in young children but can persist into adulthood.",
    affects:
      "Skin (hives, eczema), gastrointestinal tract (vomiting, diarrhea, cramps), respiratory system (wheezing, nasal congestion), cardiovascular system (anaphylaxis in severe cases).",
    avoidance:
      "Avoid all dairy products: milk, cheese, butter, yogurt, cream, ice cream. Check labels for casein, whey, lactalbumin. Watch for hidden dairy in bread, processed meats, and sauces. Use plant-based alternatives (oat, soy, almond milk). Ensure adequate calcium and vitamin D from other sources.",
  },
  {
    name: "Eggs",
    aliases: ["egg", "eggs", "egg white", "egg yolk", "albumin", "ovalbumin"],
    synopsis:
      "A reaction to proteins found in egg whites (more common) or yolks. One of the most common childhood food allergies; many children outgrow it by adolescence.",
    affects:
      "Skin (hives, eczema), gastrointestinal tract (nausea, vomiting), respiratory system (nasal congestion, asthma), cardiovascular system (anaphylaxis).",
    avoidance:
      "Avoid eggs and egg-containing products. Read labels for albumin, globulin, lysozyme, ovalbumin. Avoid baked goods, mayonnaise, meringue, and some pasta. Some flu vaccines are egg-based — discuss alternatives with your doctor. Egg substitutes exist for baking (flax egg, applesauce).",
  },
  {
    name: "Wheat",
    aliases: ["wheat", "gluten", "wheat allergy"],
    synopsis:
      "An immune reaction to proteins in wheat (not the same as celiac disease or gluten sensitivity, though symptoms may overlap). The body produces IgE antibodies against wheat proteins.",
    affects:
      "Skin (hives, eczema), gastrointestinal tract (cramps, nausea, vomiting), respiratory system (nasal congestion, asthma), cardiovascular system (exercise-induced wheat anaphylaxis).",
    avoidance:
      "Avoid wheat in all forms: bread, pasta, cereal, flour, couscous, semolina. Read labels for wheat starch, wheat germ, and modified food starch. Note: other grains (rice, oats, barley, rye) are usually safe unless you also have celiac disease. Use wheat-free flour alternatives.",
  },
  {
    name: "Soy",
    aliases: ["soy", "soybean", "soya", "edamame", "tofu"],
    synopsis:
      "A reaction to soy proteins. Very common in infants and young children, often outgrown. Soy is pervasive in processed foods, making avoidance challenging.",
    affects:
      "Skin (hives, itching), gastrointestinal tract (nausea, diarrhea), respiratory system (wheezing), mouth (tingling, swelling).",
    avoidance:
      "Avoid soy milk, tofu, tempeh, edamame, soy sauce, miso. Read labels for soy lecithin, soy protein isolate, textured vegetable protein. Check processed foods, baked goods, and canned soups. Highly refined soy oil is usually tolerated but confirm with your allergist.",
  },
  {
    name: "Sesame",
    aliases: ["sesame", "sesame seeds", "tahini"],
    synopsis:
      "A growing food allergy now recognized as a major allergen in the US (as of 2023). Reactions can be severe and sesame is often hidden in food products.",
    affects:
      "Skin (hives, eczema), gastrointestinal tract (vomiting, diarrhea), respiratory system (wheezing, throat tightness), cardiovascular system (anaphylaxis).",
    avoidance:
      "Avoid sesame seeds, sesame oil, tahini, and hummus. Check labels on bread, crackers, and bagels (often topped with sesame). Be cautious with Middle Eastern, Asian, and African cuisines. Sesame can be listed as 'natural flavoring' in some products.",
  },

  // ── Environmental Allergies ──
  {
    name: "Pollen",
    aliases: ["pollen", "hay fever", "seasonal allergies", "allergic rhinitis", "tree pollen", "grass pollen", "ragweed"],
    synopsis:
      "An immune reaction to airborne pollen from trees, grasses, or weeds. Known as hay fever or allergic rhinitis. Seasonal patterns depend on the pollen source: trees (spring), grasses (summer), weeds (fall).",
    affects:
      "Nasal passages (congestion, sneezing, runny nose), eyes (itching, watering, redness), throat (postnasal drip), lungs (can trigger asthma).",
    avoidance:
      "Monitor pollen counts and limit outdoor time on high-count days. Keep windows closed during pollen season. Shower after being outdoors. Use HEPA air filters. Start antihistamines before season begins. Consider allergy immunotherapy (shots or sublingual tablets) for long-term relief.",
  },
  {
    name: "Dust Mites",
    aliases: ["dust mites", "dust", "house dust", "dust mite"],
    synopsis:
      "A reaction to proteins in the waste and body fragments of microscopic dust mites that live in household dust. A year-round (perennial) allergy that can worsen in humid environments.",
    affects:
      "Nasal passages (congestion, sneezing), eyes (itching, watering), lungs (asthma exacerbation), skin (eczema flare-ups).",
    avoidance:
      "Use allergen-proof mattress and pillow covers. Wash bedding weekly in hot water (130°F+). Keep indoor humidity below 50%. Remove carpeting where possible. Use HEPA vacuum filters. Dust surfaces with a damp cloth regularly.",
  },
  {
    name: "Mold",
    aliases: ["mold", "mould", "mold spores", "fungal"],
    synopsis:
      "A reaction to airborne mold spores. Mold grows in damp environments both indoors and outdoors. Can be seasonal (outdoor mold) or perennial (indoor mold).",
    affects:
      "Nasal passages (congestion, sneezing), eyes (itching, watering), lungs (asthma, allergic bronchopulmonary aspergillosis), skin.",
    avoidance:
      "Fix water leaks promptly. Use exhaust fans in bathrooms and kitchens. Keep indoor humidity below 50%. Clean visible mold with appropriate solutions. Avoid raking leaves or cutting grass. Use HEPA air purifiers. Avoid basements and other damp areas when possible.",
  },
  {
    name: "Pet Dander",
    aliases: ["pet dander", "cat", "cat dander", "dog", "dog dander", "animal dander", "cats", "dogs"],
    synopsis:
      "A reaction to proteins found in the skin flakes (dander), saliva, and urine of animals — most commonly cats and dogs. Cat allergens are particularly sticky and can remain in environments for months.",
    affects:
      "Nasal passages (congestion, sneezing), eyes (itching, redness), lungs (asthma, wheezing), skin (hives, eczema).",
    avoidance:
      "Keep pets out of bedrooms. Use HEPA air purifiers. Wash hands after touching animals. Bathe pets weekly. Remove carpeting (hard floors trap less dander). Consider hypoallergenic breeds (though no breed is truly allergen-free). Wash pet bedding frequently.",
  },
  {
    name: "Cockroach",
    aliases: ["cockroach", "roach"],
    synopsis:
      "A reaction to proteins in cockroach droppings, saliva, and body parts. A significant trigger for asthma, especially in urban environments. Year-round exposure in infested homes.",
    affects:
      "Nasal passages (congestion, sneezing), lungs (asthma — a major trigger in inner-city children), eyes, skin.",
    avoidance:
      "Seal cracks and entry points. Keep food in sealed containers. Clean up crumbs and spills immediately. Take out garbage regularly. Fix water leaks. Use roach traps and baits (avoid sprays that disperse allergens). Professional pest control if infestation is significant.",
  },

  // ── Insect Allergies ──
  {
    name: "Bee Stings",
    aliases: ["bee", "bee sting", "bee venom", "honeybee", "wasp", "hornet", "yellow jacket"],
    synopsis:
      "A potentially life-threatening allergic reaction to venom from bee, wasp, hornet, or yellow jacket stings. Reactions can escalate with subsequent stings.",
    affects:
      "Skin (large local swelling, hives far from sting site), respiratory system (throat swelling, difficulty breathing), cardiovascular system (drop in blood pressure, anaphylaxis).",
    avoidance:
      "Wear shoes outdoors. Avoid bright-colored clothing and floral perfumes. Don't drink from open cans outdoors. Stay calm and move away slowly if insects approach. Carry an EpiPen at all times. Consider venom immunotherapy (allergy shots), which is 97% effective.",
  },

  // ── Contact Allergies ──
  {
    name: "Latex",
    aliases: ["latex", "rubber", "natural rubber latex"],
    synopsis:
      "A reaction to natural rubber latex proteins found in gloves, balloons, condoms, and medical devices. Healthcare workers and people with spina bifida are at higher risk. Can cross-react with certain foods.",
    affects:
      "Skin (contact dermatitis, hives), respiratory system (from airborne particles — sneezing, wheezing), cardiovascular system (anaphylaxis with direct contact during surgery).",
    avoidance:
      "Use non-latex gloves (nitrile, vinyl). Alert healthcare providers before procedures. Avoid balloons and rubber bands. Be aware of cross-reactive foods: bananas, avocados, kiwi, chestnuts. Carry an EpiPen if you have a history of severe reactions.",
  },
  {
    name: "Nickel",
    aliases: ["nickel", "nickel allergy", "metal allergy"],
    synopsis:
      "The most common cause of contact dermatitis from metals. A delayed-type hypersensitivity reaction that develops 12-48 hours after skin contact with nickel-containing objects.",
    affects:
      "Skin at the contact site (redness, itching, blistering, dry patches). Commonly affects earlobes, wrists, waistline, and neck where jewelry or metal touches skin.",
    avoidance:
      "Wear hypoallergenic or nickel-free jewelry (surgical steel, titanium, 14k+ gold). Cover metal buttons and belt buckles with fabric or clear nail polish. Choose plastic or coated eyeglass frames. Use nickel-testing kits on suspect items.",
  },

  // ── Other Common Allergies ──
  {
    name: "Sulfites",
    aliases: ["sulfite", "sulfites", "sulphites", "sodium bisulfite", "sodium metabisulfite"],
    synopsis:
      "A sensitivity to sulfite preservatives used in food and drinks. More common in people with asthma. Not a true IgE-mediated allergy in most cases but can cause serious reactions.",
    affects:
      "Respiratory system (bronchospasm, wheezing — especially in asthmatics), skin (flushing, hives), gastrointestinal tract (nausea, diarrhea).",
    avoidance:
      "Avoid wine, dried fruits, shrimp, and processed potatoes (common high-sulfite foods). Read labels for sodium bisulfite, sodium metabisulfite, sulfur dioxide. Choose fresh foods over processed. Organic wines are often lower in sulfites.",
  },
  {
    name: "Fragrances",
    aliases: ["fragrance", "perfume", "scent", "fragrance allergy"],
    synopsis:
      "A reaction to natural or synthetic fragrance compounds found in personal care products, cleaning supplies, and air fresheners. Can be a true allergy or an irritant response.",
    affects:
      "Skin (contact dermatitis, redness, itching), respiratory system (headaches, nasal congestion, asthma exacerbation), eyes (watering, irritation).",
    avoidance:
      "Choose fragrance-free (not 'unscented') personal care products. Avoid air fresheners and scented candles. Use fragrance-free laundry detergent. Ask coworkers and family to minimize perfume/cologne use around you. Read ingredient labels for 'parfum' or 'fragrance'.",
  },
  {
    name: "Penicillium Mold",
    aliases: ["penicillium", "blue cheese", "cheese mold"],
    synopsis:
      "A reaction specifically to Penicillium mold species, which are used in making blue cheese and some fermented foods. Related to but distinct from general mold allergy and penicillin allergy.",
    affects:
      "Respiratory system (sneezing, congestion, asthma), skin (rash), gastrointestinal tract when consumed in food.",
    avoidance:
      "Avoid blue cheese (Roquefort, Gorgonzola, Stilton), Brie, and Camembert. Be cautious with aged/fermented foods. Note: Penicillium mold allergy does not necessarily mean you are allergic to penicillin antibiotics — confirm with your allergist.",
  },
];

/**
 * Look up allergy info by name.
 * Performs case-insensitive matching against both the canonical name and aliases.
 */
export function findAllergyInfo(allergyName: string): AllergyInfo | null {
  const lower = allergyName.toLowerCase();
  return (
    ALLERGY_DATA.find(
      (a) =>
        a.name.toLowerCase() === lower ||
        a.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))
    ) ?? null
  );
}

export default ALLERGY_DATA;
