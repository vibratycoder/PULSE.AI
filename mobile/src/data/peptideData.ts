/**
 * Peptide data bank — reference information for common research and therapeutic peptides.
 *
 * Each entry includes a brief synopsis (what the peptide is),
 * what it does (effects and benefits), and how it works (mechanism of action).
 */

export interface PeptideInfo {
  name: string;
  aliases: string[];
  synopsis: string;
  whatItDoes: string;
  howItWorks: string;
}

const PEPTIDE_DATA: PeptideInfo[] = [
  // ── Healing & Recovery ──
  {
    name: "BPC-157",
    aliases: ["bpc-157", "bpc 157", "body protection compound", "body protection compound-157"],
    synopsis:
      "A synthetic peptide derived from a naturally occurring protein found in human gastric juice. Known as Body Protection Compound-157, it is one of the most widely used peptides for tissue repair and healing.",
    whatItDoes:
      "Accelerates healing of muscles, tendons, ligaments, and the gut lining. Reduces inflammation, protects organs from damage (including NSAID-induced gut injury), promotes angiogenesis (new blood vessel formation), and may support nerve repair. Commonly used for sports injuries and joint recovery.",
    howItWorks:
      "Upregulates growth factor expression (VEGF, EGF) to promote angiogenesis and tissue regeneration. Modulates the nitric oxide (NO) system to support blood flow and healing. Interacts with the dopaminergic system and has cytoprotective effects on the GI tract by stabilizing the gut mucosal barrier.",
  },
  {
    name: "TB-500",
    aliases: ["tb-500", "tb 500", "thymosin beta-4", "thymosin beta 4", "tb4"],
    synopsis:
      "A synthetic fragment of Thymosin Beta-4, a naturally occurring 43-amino acid peptide present in nearly all human cells. Plays a critical role in cell migration, wound healing, and tissue repair.",
    whatItDoes:
      "Promotes wound healing, reduces inflammation, and supports tissue repair — particularly in muscles, tendons, and ligaments. Enhances flexibility, reduces scar tissue formation, and supports hair regrowth. Often stacked with BPC-157 for synergistic healing effects.",
    howItWorks:
      "Upregulates actin, a cell-building protein essential for cell migration and proliferation. Promotes angiogenesis and cell migration to injury sites. Modulates inflammatory cytokines and activates stem/progenitor cells. Its small molecular size allows it to travel through tissues to reach areas of injury.",
  },

  // ── Growth Hormone Secretagogues ──
  {
    name: "CJC-1295",
    aliases: ["cjc-1295", "cjc 1295", "cjc-1295 dac", "mod grf 1-29"],
    synopsis:
      "A synthetic analog of growth hormone-releasing hormone (GHRH) that stimulates the pituitary gland to produce growth hormone. Available with or without DAC (Drug Affinity Complex), which extends its half-life.",
    whatItDoes:
      "Increases growth hormone (GH) and IGF-1 levels, promoting fat loss, lean muscle gain, improved sleep quality, faster recovery, and enhanced skin elasticity. The DAC version provides sustained GH elevation, while the non-DAC version (Mod GRF 1-29) produces more natural pulsatile GH release.",
    howItWorks:
      "Binds to GHRH receptors on the anterior pituitary gland, stimulating somatotroph cells to synthesize and release growth hormone. The DAC modification adds a lysine linker that binds to albumin, extending the half-life from ~30 minutes to ~8 days, allowing less frequent dosing.",
  },
  {
    name: "Ipamorelin",
    aliases: ["ipamorelin", "ipam"],
    synopsis:
      "A highly selective growth hormone secretagogue peptide (GHSP) that stimulates GH release with minimal side effects. Considered one of the safest GH-releasing peptides due to its selectivity.",
    whatItDoes:
      "Stimulates growth hormone release without significantly affecting cortisol, prolactin, or appetite (unlike GHRP-6). Supports fat loss, lean muscle development, improved sleep, bone density, and anti-aging benefits. Often combined with CJC-1295 for enhanced GH output.",
    howItWorks:
      "Selectively binds to the ghrelin/GHS receptor (GHSR) on pituitary somatotrophs, triggering GH release in a dose-dependent manner. Unlike other GHRPs, it does not activate the ghrelin receptor pathways that increase appetite or cortisol. Works synergistically with GHRH analogs like CJC-1295.",
  },
  {
    name: "Tesamorelin",
    aliases: ["tesamorelin", "egrifta"],
    synopsis:
      "An FDA-approved GHRH analog used to reduce visceral adipose tissue (belly fat) in HIV-associated lipodystrophy. The only FDA-approved GHRH peptide, giving it a unique regulatory status.",
    whatItDoes:
      "Reduces visceral fat, increases IGF-1 levels, and may improve cognitive function. FDA-approved specifically for reducing excess abdominal fat in HIV patients on antiretroviral therapy. Also studied for cognitive benefits in mild cognitive impairment.",
    howItWorks:
      "A modified 44-amino acid GHRH analog that binds to GHRH receptors on the pituitary, stimulating GH release. Contains a trans-3-hexenoic acid modification that protects it from enzymatic degradation, extending its biological activity compared to native GHRH.",
  },
  {
    name: "Sermorelin",
    aliases: ["sermorelin", "geref"],
    synopsis:
      "A synthetic 29-amino acid analog of GHRH — the shortest fully functional fragment of the native 44-amino acid hormone. One of the earliest peptides used for growth hormone optimization.",
    whatItDoes:
      "Stimulates natural, pulsatile growth hormone release. Supports fat loss, improved sleep quality, enhanced recovery, increased lean muscle mass, and anti-aging benefits. Maintains the body's natural GH feedback loops, reducing the risk of excess GH.",
    howItWorks:
      "Contains the first 29 amino acids of GHRH (the biologically active portion). Binds to GHRH receptors on the anterior pituitary, stimulating GH synthesis and secretion. Preserves normal GH pulsatility and feedback mechanisms, unlike exogenous GH administration.",
  },
  {
    name: "GHRP-6",
    aliases: ["ghrp-6", "ghrp 6", "growth hormone releasing peptide 6"],
    synopsis:
      "One of the first growth hormone releasing peptides discovered. A potent GH secretagogue that also significantly increases appetite through ghrelin pathway activation.",
    whatItDoes:
      "Strongly stimulates growth hormone release, increases appetite and food intake, promotes fat loss and muscle gain. The appetite-stimulating effect can be beneficial for underweight individuals but problematic for those trying to lose fat.",
    howItWorks:
      "Binds to the ghrelin receptor (GHSR-1a) on pituitary somatotrophs, triggering GH release. Also activates ghrelin pathways in the hypothalamus, which drives the significant increase in hunger. Stimulates both GH and mild cortisol/prolactin release, making it less selective than Ipamorelin.",
  },
  {
    name: "GHRP-2",
    aliases: ["ghrp-2", "ghrp 2", "growth hormone releasing peptide 2"],
    synopsis:
      "A synthetic growth hormone releasing peptide considered the strongest GHRP in terms of GH output. More potent than GHRP-6 with moderate appetite stimulation.",
    whatItDoes:
      "Produces the highest growth hormone release of any GHRP. Promotes fat loss, muscle growth, improved recovery, and better sleep. Has moderate appetite stimulation (less than GHRP-6 but more than Ipamorelin).",
    howItWorks:
      "Binds to the ghrelin receptor with high affinity, producing a strong GH release signal. Also mildly stimulates ACTH and cortisol release. Can amplify the GH-releasing effect of GHRH analogs when used together, as GHRPs and GHRH act through complementary pathways.",
  },
  {
    name: "Hexarelin",
    aliases: ["hexarelin", "examorelin"],
    synopsis:
      "A potent synthetic growth hormone releasing peptide with cardioprotective properties beyond its GH-releasing effects. One of the strongest GHRPs available.",
    whatItDoes:
      "Powerfully stimulates GH release, promotes fat loss and muscle growth. Uniquely among GHRPs, it has direct cardioprotective effects — reducing cardiac fibrosis and protecting heart tissue independently of GH. Appetite stimulation is moderate.",
    howItWorks:
      "Activates the ghrelin receptor to stimulate pituitary GH release. Additionally binds to CD36 scavenger receptors on cardiac tissue, providing direct cardioprotective effects through anti-fibrotic and anti-apoptotic pathways. This cardiac benefit is independent of GH secretion.",
  },
  {
    name: "MK-677",
    aliases: ["mk-677", "mk 677", "ibutamoren", "nutrobal"],
    synopsis:
      "An oral, non-peptide growth hormone secretagogue. Although commonly grouped with peptides, it is technically a small molecule that mimics ghrelin. Notable for its oral bioavailability.",
    whatItDoes:
      "Increases GH and IGF-1 levels with convenient oral dosing. Promotes fat loss, lean muscle gain, improved sleep quality, increased appetite, and bone density. Effects are sustained with long-term use without significant desensitization.",
    howItWorks:
      "Mimics ghrelin by binding to the GHSR-1a receptor, stimulating pituitary GH release. Unlike injectable peptides, it is orally bioavailable due to its non-peptide chemical structure. Has a long half-life (~24 hours), allowing once-daily dosing. Does not suppress natural GH production.",
  },

  // ── Neuroprotective & Cognitive ──
  {
    name: "Selank",
    aliases: ["selank", "selanc"],
    synopsis:
      "A synthetic heptapeptide developed at the Russian Academy of Sciences, based on the naturally occurring immunomodulatory peptide tuftsin with an added Pro-Gly-Pro sequence for stability.",
    whatItDoes:
      "Reduces anxiety and depression without sedation or cognitive impairment. Enhances memory, learning, and cognitive function. Modulates immune function and has nootropic (brain-enhancing) effects. Used intranasally for fast absorption.",
    howItWorks:
      "Modulates the GABAergic system (enhancing inhibitory neurotransmission without direct receptor binding), influences BDNF (brain-derived neurotrophic factor) expression for neuroprotection, and affects serotonin metabolism. Also modulates IL-6 and other cytokines for immunomodulatory effects. Its tuftsin component provides immune-enhancing properties.",
  },
  {
    name: "Semax",
    aliases: ["semax"],
    synopsis:
      "A synthetic heptapeptide analog of ACTH (4-10), developed in Russia and approved there for clinical use. Considered one of the most potent nootropic peptides with neuroprotective properties.",
    whatItDoes:
      "Enhances memory, attention, and learning capacity. Provides neuroprotection against oxidative stress and ischemia. Promotes nerve growth factor (NGF) and BDNF expression. Used clinically in Russia for stroke recovery, cognitive disorders, and optic nerve disease.",
    howItWorks:
      "Derived from the ACTH fragment 4-10 but lacks hormonal (adrenocorticotropic) activity. Increases BDNF and NGF expression, promoting neuronal survival and growth. Modulates dopaminergic and serotonergic neurotransmission. Enhances cerebral blood flow and has antioxidant properties that protect neurons from ischemic damage.",
  },
  {
    name: "Dihexa",
    aliases: ["dihexa"],
    synopsis:
      "An angiotensin IV analog and potent cognitive-enhancing peptide. Reported to be approximately 10 million times more potent than BDNF at promoting neuronal connections.",
    whatItDoes:
      "Dramatically enhances cognitive function, memory formation, and learning. Promotes the formation of new synaptic connections (synaptogenesis). Being researched as a potential treatment for Alzheimer's disease and other neurodegenerative conditions.",
    howItWorks:
      "Binds to hepatocyte growth factor (HGF) receptor (c-Met) and potentiates HGF/c-Met signaling. This activates downstream pathways that promote dendritic spine formation, synaptogenesis, and neuronal survival. Acts through the angiotensin IV receptor system to enhance synaptic plasticity.",
  },
  {
    name: "DSIP",
    aliases: ["dsip", "delta sleep-inducing peptide", "delta sleep inducing peptide"],
    synopsis:
      "Delta Sleep-Inducing Peptide, a naturally occurring neuromodulator first isolated from rabbit brain tissue. Promotes deep, restorative delta-wave sleep.",
    whatItDoes:
      "Improves sleep quality by promoting delta (deep) sleep stages. Reduces stress, normalizes disrupted sleep patterns, and may help regulate cortisol and other stress hormones. Also studied for pain modulation and withdrawal symptom management.",
    howItWorks:
      "Modulates GABAergic neurotransmission and interacts with opioid receptor systems. Influences the hypothalamic-pituitary-adrenal (HPA) axis to normalize stress hormone release. Promotes slow-wave sleep by modulating sleep-wake regulatory centers in the hypothalamus. Exact receptor targets are still being characterized.",
  },

  // ── Anti-Aging & Longevity ──
  {
    name: "Epithalon",
    aliases: ["epithalon", "epitalon", "epithalone"],
    synopsis:
      "A synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on the natural peptide epithalamin produced by the pineal gland. One of the most studied anti-aging peptides, developed by Professor Vladimir Khavinson.",
    whatItDoes:
      "Activates telomerase, the enzyme that lengthens telomeres — the protective caps on chromosomes that shorten with aging. Regulates the neuroendocrine system, restores melatonin production, improves sleep, and has shown lifespan extension in animal studies.",
    howItWorks:
      "Activates telomerase (hTERT — human telomerase reverse transcriptase), which adds telomeric repeats (TTAGGG) to the ends of chromosomes. This counteracts telomere shortening associated with cellular aging. Also stimulates pineal gland melatonin production and modulates gene expression related to cellular senescence.",
  },
  {
    name: "GHK-Cu",
    aliases: ["ghk-cu", "ghk cu", "copper peptide", "copper tripeptide"],
    synopsis:
      "A naturally occurring copper-binding tripeptide (Gly-His-Lys) found in human plasma, saliva, and urine. Levels decline significantly with age. One of the most well-researched peptides for skin and tissue regeneration.",
    whatItDoes:
      "Stimulates collagen and elastin synthesis, promotes wound healing, reduces fine lines and wrinkles, tightens skin, reduces inflammation, and promotes hair growth. Also has antioxidant and anti-inflammatory effects. Used both topically (skincare) and via injection.",
    howItWorks:
      "The copper ion is essential for activating enzymes involved in collagen synthesis (lysyl oxidase), antioxidant defense (superoxide dismutase), and tissue remodeling. GHK-Cu modulates the expression of thousands of genes, upregulating those involved in tissue repair and stem cell recruitment while downregulating inflammatory and tissue-destructive genes.",
  },
  {
    name: "MOTS-c",
    aliases: ["mots-c", "mots c", "mitochondrial orf of the 12s rrna type-c"],
    synopsis:
      "A mitochondria-derived peptide encoded by the 12S rRNA gene in mitochondrial DNA. One of the first peptides discovered to be encoded by mitochondrial (not nuclear) DNA, representing a new class of signaling molecules.",
    whatItDoes:
      "Mimics the metabolic benefits of exercise — improves insulin sensitivity, promotes fat oxidation, enhances glucose metabolism, and increases physical performance. May protect against age-related metabolic decline and obesity. Sometimes called an 'exercise mimetic.'",
    howItWorks:
      "Activates the AMPK pathway (the same energy-sensing pathway activated by exercise and metformin). Inhibits the folate-methionine cycle, leading to AMPK activation and enhanced glucose uptake in skeletal muscle. Translocates from mitochondria to the nucleus under metabolic stress to regulate gene expression for metabolic adaptation.",
  },
  {
    name: "SS-31",
    aliases: ["ss-31", "ss 31", "elamipretide", "bendavia"],
    synopsis:
      "A mitochondria-targeted tetrapeptide (D-Arg-Dmt-Lys-Phe-NH2) that selectively concentrates in the inner mitochondrial membrane. In clinical trials for mitochondrial diseases and heart failure.",
    whatItDoes:
      "Protects and restores mitochondrial function, reduces oxidative stress, and improves cellular energy production. Being studied for heart failure, mitochondrial myopathies, age-related macular degeneration, and kidney injury. May slow mitochondrial aging.",
    howItWorks:
      "Selectively binds to cardiolipin, a phospholipid found exclusively on the inner mitochondrial membrane. This stabilizes the electron transport chain, reduces electron leak (and thus reactive oxygen species production), and optimizes ATP synthesis. Its alternating aromatic-cationic structure allows it to cross membranes and concentrate 1000-fold in mitochondria.",
  },

  // ── Immune & Anti-Inflammatory ──
  {
    name: "Thymosin Alpha-1",
    aliases: ["thymosin alpha-1", "thymosin alpha 1", "ta1", "zadaxin"],
    synopsis:
      "A naturally occurring peptide produced by the thymus gland that plays a central role in immune system maturation and function. FDA-approved as an orphan drug and used clinically in over 30 countries.",
    whatItDoes:
      "Enhances immune function by activating T-cells, natural killer cells, and dendritic cells. Used clinically for hepatitis B/C, as an immune adjuvant alongside vaccines, in cancer immunotherapy, and for immune support in immunocompromised patients. Also studied for sepsis and COVID-19.",
    howItWorks:
      "Activates toll-like receptors (TLR2, TLR9) on dendritic cells and macrophages, promoting innate immune recognition. Stimulates T-cell maturation and differentiation (particularly CD4+ and CD8+ T-cells). Enhances interferon-alpha and interleukin-2 production. Modulates the immune response toward a Th1 (cell-mediated) profile.",
  },
  {
    name: "KPV",
    aliases: ["kpv", "k-p-v"],
    synopsis:
      "A tripeptide (Lys-Pro-Val) derived from the C-terminal end of alpha-melanocyte stimulating hormone (alpha-MSH). Retains the anti-inflammatory properties of alpha-MSH without its pigmentation effects.",
    whatItDoes:
      "Potent anti-inflammatory effects, particularly in the gut. Reduces intestinal inflammation, supports gut barrier integrity, and modulates immune responses. Used for inflammatory bowel conditions, skin inflammation, and general anti-inflammatory support. Can be taken orally for gut-specific effects.",
    howItWorks:
      "Enters immune cells and directly inhibits NF-kB signaling — the master switch for inflammatory gene expression. Unlike full-length alpha-MSH, KPV does not activate melanocortin receptors (so it does not cause skin darkening). Its small size allows direct cellular uptake and intracellular NF-kB pathway inhibition.",
  },
  {
    name: "LL-37",
    aliases: ["ll-37", "ll37", "cathelicidin"],
    synopsis:
      "The only human cathelicidin antimicrobial peptide. A 37-amino acid peptide that is part of the innate immune system's first line of defense against infections.",
    whatItDoes:
      "Provides broad-spectrum antimicrobial activity against bacteria, viruses, and fungi. Promotes wound healing, modulates immune response, and supports gut health. Used for chronic infections, biofilm disruption, and immune support. May help with Lyme disease and mold illness.",
    howItWorks:
      "Disrupts microbial cell membranes through electrostatic interaction with negatively charged bacterial membranes, creating pores that kill the pathogen. Also neutralizes bacterial endotoxins (LPS), disrupts biofilms, and recruits immune cells to infection sites through chemotactic signaling. Activates formyl peptide receptor-like 1 (FPRL1) on immune cells.",
  },

  // ── Sexual Health ──
  {
    name: "PT-141",
    aliases: ["pt-141", "pt 141", "bremelanotide", "vyleesi"],
    synopsis:
      "A synthetic melanocortin receptor agonist derived from Melanotan II. FDA-approved (as Vyleesi) for treating hypoactive sexual desire disorder (HSDD) in premenopausal women.",
    whatItDoes:
      "Increases sexual desire and arousal by acting directly on the central nervous system rather than the vascular system (unlike PDE5 inhibitors like Viagra). Effective for both men and women. Does not require sexual stimulation to work — it enhances the desire itself.",
    howItWorks:
      "Activates melanocortin-4 receptors (MC4R) in the hypothalamus, which are involved in regulating sexual arousal and desire. Unlike PDE5 inhibitors that act on blood flow, PT-141 works through the brain's dopaminergic pathways that control sexual motivation. This central mechanism is why it can treat desire disorders, not just performance issues.",
  },

  // ── Fat Loss & Metabolism ──
  {
    name: "AOD-9604",
    aliases: ["aod-9604", "aod 9604", "anti-obesity drug 9604"],
    synopsis:
      "A modified fragment of human growth hormone (HGH fragment 176-191) developed specifically for fat loss. Retains the fat-burning properties of GH without its growth-promoting or diabetogenic effects.",
    whatItDoes:
      "Stimulates fat breakdown (lipolysis) and inhibits new fat formation (lipogenesis). Does not affect blood sugar levels or cause insulin resistance — unlike full-length growth hormone. Targets abdominal fat specifically. Has also shown cartilage repair properties.",
    howItWorks:
      "Mimics the lipolytic region of growth hormone (amino acids 176-191) by activating beta-3 adrenergic receptor pathways in adipose tissue. Stimulates hormone-sensitive lipase to break down stored triglycerides while inhibiting fatty acid synthase (blocking new fat creation). Does not bind to the GH receptor, so it lacks GH's growth and diabetogenic effects.",
  },
  {
    name: "5-Amino-1MQ",
    aliases: ["5-amino-1mq", "5 amino 1mq"],
    synopsis:
      "A small molecule (not technically a peptide) that inhibits the enzyme NNMT. Commonly grouped with peptides in metabolic optimization protocols due to its use in similar clinical contexts.",
    whatItDoes:
      "Promotes fat loss by increasing cellular energy expenditure, enhances muscle stem cell activation, and may improve metabolic health. Reduces fat cell size and increases NAD+ levels. Does not affect appetite or CNS stimulation.",
    howItWorks:
      "Selectively blocks nicotinamide N-methyltransferase (NNMT), an enzyme that is overexpressed in fat tissue and contributes to obesity. NNMT inhibition increases NAD+ and SAM (S-adenosylmethionine) availability, boosting cellular metabolism and energy expenditure. Also activates the sirtuin pathway through increased NAD+ levels.",
  },

  // ── Tanning & Photoprotection ──
  {
    name: "Melanotan II",
    aliases: ["melanotan ii", "melanotan 2", "mt-2", "mt2", "mt-ii"],
    synopsis:
      "A synthetic analog of alpha-melanocyte stimulating hormone (alpha-MSH) originally developed at the University of Arizona for skin cancer prevention through tanning without UV exposure.",
    whatItDoes:
      "Stimulates melanogenesis (skin tanning) without significant UV exposure, enhances libido and sexual function, and may suppress appetite. Used primarily for cosmetic tanning. PT-141 was derived from this peptide due to its sexual side effects.",
    howItWorks:
      "Activates melanocortin receptors MC1R (causing melanin production/tanning), MC3R and MC4R (affecting sexual function and appetite), and MC5R. The broad receptor activation explains both its tanning effects and its wide range of side effects including nausea, flushing, and sexual arousal.",
  },
];

/**
 * Look up peptide info by name.
 * Performs case-insensitive matching against both the canonical name and aliases.
 */
export function findPeptideInfo(peptideName: string): PeptideInfo | null {
  const lower = peptideName.toLowerCase();
  return (
    PEPTIDE_DATA.find(
      (p) =>
        p.name.toLowerCase() === lower ||
        p.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))
    ) ?? null
  );
}

export default PEPTIDE_DATA;
