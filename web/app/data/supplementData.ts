export interface SupplementInfo {
  name: string;
  aliases: string[];
  synopsis: string;
  whatItDoes: string;
  howItWorks: string;
}

const SUPPLEMENT_DATA: SupplementInfo[] = [
  {
    name: "Vitamin D3",
    aliases: ["vitamin d", "vitamin d3", "cholecalciferol", "d3"],
    synopsis:
      "Vitamin D3 (cholecalciferol) is a fat-soluble secosteroid produced in the skin upon exposure to UVB radiation and also obtained through diet and supplementation. It is the preferred supplemental form of vitamin D due to its superior bioavailability and longer-lasting effect on serum 25(OH)D levels compared to D2.",
    whatItDoes:
      "Vitamin D3 supports calcium absorption and bone mineralization, playing a critical role in preventing osteoporosis and rickets. It modulates immune function by promoting innate antimicrobial responses while dampening excessive adaptive immunity, and is associated with improved mood regulation and reduced risk of seasonal affective disorder. Adequate levels are also linked to better cardiovascular health, lower inflammation, and reduced risk of certain cancers.",
    howItWorks:
      "After ingestion or cutaneous synthesis, D3 is hydroxylated in the liver to 25-hydroxyvitamin D and then in the kidneys to the active hormone 1,25-dihydroxyvitamin D (calcitriol). Calcitriol binds to the vitamin D receptor (VDR), a nuclear transcription factor expressed in nearly every cell type, regulating the expression of over 1,000 genes involved in calcium transport, cell proliferation, differentiation, and immune modulation. It upregulates intestinal calcium-binding proteins (calbindins) to enhance calcium and phosphorus absorption from the gut.",
  },
  {
    name: "Fish Oil",
    aliases: ["fish oil", "omega-3", "omega 3", "epa", "dha"],
    synopsis:
      "Fish oil is a dietary supplement derived from the tissues of oily fish such as salmon, mackerel, and sardines, providing the long-chain omega-3 polyunsaturated fatty acids eicosapentaenoic acid (EPA) and docosahexaenoic acid (DHA). These essential fats cannot be efficiently synthesized by the body and must be obtained through diet or supplementation.",
    whatItDoes:
      "Fish oil significantly reduces blood triglyceride levels and supports cardiovascular health by lowering blood pressure, reducing arterial plaque formation, and decreasing the risk of arrhythmias. DHA is a major structural component of brain and retinal tissue, supporting cognitive function, memory, and visual acuity throughout the lifespan. EPA and DHA also exert potent anti-inflammatory effects, benefiting joint health and potentially reducing symptoms of depression and anxiety.",
    howItWorks:
      "EPA and DHA are incorporated into cell membrane phospholipids, where they alter membrane fluidity and lipid raft composition, influencing receptor signaling and ion channel function. EPA competitively inhibits the conversion of arachidonic acid to pro-inflammatory series-2 prostaglandins and series-4 leukotrienes, instead generating less inflammatory or pro-resolving mediators called resolvins, protectins, and maresins. These specialized pro-resolving mediators actively promote the resolution of inflammation and tissue repair rather than simply suppressing immune activity.",
  },
  {
    name: "Magnesium",
    aliases: ["magnesium", "mag", "magnesium glycinate", "magnesium citrate", "magnesium threonate"],
    synopsis:
      "Magnesium is an essential mineral and cofactor for over 600 enzymatic reactions in the human body, including those involved in energy production, protein synthesis, and nucleic acid stability. Despite its importance, subclinical magnesium deficiency is widespread, estimated to affect up to 50% of the U.S. population.",
    whatItDoes:
      "Magnesium supports healthy muscle and nerve function, helps regulate blood pressure, and is essential for maintaining normal heart rhythm. It plays a critical role in sleep quality by activating the parasympathetic nervous system and regulating melatonin and GABA pathways, and is widely used to reduce muscle cramps and tension. Adequate magnesium intake is associated with improved insulin sensitivity, reduced migraine frequency, and better stress resilience.",
    howItWorks:
      "Magnesium serves as a cofactor for ATP-dependent enzymes, stabilizing ATP in its biologically active Mg-ATP form, which is required for virtually all phosphorylation reactions and energy metabolism. It regulates neuronal excitability by acting as a physiological voltage-dependent blocker of NMDA glutamate receptors, preventing excessive calcium influx and excitotoxicity. Magnesium also modulates the hypothalamic-pituitary-adrenal (HPA) axis, reducing cortisol secretion under stress, and activates the enzyme tryptophan hydroxylase, which is required for serotonin synthesis.",
  },
  {
    name: "Zinc",
    aliases: ["zinc", "zinc picolinate", "zinc gluconate"],
    synopsis:
      "Zinc is an essential trace mineral required for the catalytic activity of over 300 enzymes and the structural integrity of thousands of proteins, including zinc-finger transcription factors. It is not stored in the body in significant quantities and must be consumed regularly through diet or supplementation.",
    whatItDoes:
      "Zinc is critical for robust immune function, supporting both innate and adaptive immunity, and has been shown to reduce the duration and severity of common cold symptoms when taken early. It plays a key role in wound healing, DNA synthesis, cell division, and the maintenance of healthy skin, hair, and nails. Zinc also supports reproductive health, particularly testosterone production in men, and is essential for normal taste and smell perception.",
    howItWorks:
      "Zinc functions as a catalytic, structural, or regulatory component of enzymes and proteins across every organ system. It is essential for the development and function of immune cells including neutrophils, natural killer cells, and T-lymphocytes, and supports thymulin activity required for T-cell maturation in the thymus. At the molecular level, zinc stabilizes cell membranes, inhibits NADPH oxidase-mediated reactive oxygen species generation, and modulates NF-kB signaling to regulate inflammatory cytokine production.",
  },
  {
    name: "Creatine Monohydrate",
    aliases: ["creatine", "creatine monohydrate"],
    synopsis:
      "Creatine monohydrate is a naturally occurring compound synthesized from amino acids (arginine, glycine, and methionine) in the liver and kidneys, and is one of the most extensively researched and evidence-backed sports supplements available. Approximately 95% of the body's creatine is stored in skeletal muscle as phosphocreatine.",
    whatItDoes:
      "Creatine supplementation increases intramuscular phosphocreatine stores by 20-40%, directly enhancing performance in high-intensity, short-duration activities such as sprinting and resistance training. It promotes greater training volume, accelerates recovery between sets, and supports lean mass gains by increasing cell hydration and stimulating protein synthesis pathways. Emerging research also demonstrates neuroprotective benefits, with creatine improving cognitive performance under conditions of sleep deprivation, mental fatigue, and stress.",
    howItWorks:
      "Phosphocreatine donates its high-energy phosphate group to ADP via the creatine kinase reaction, rapidly regenerating ATP during the first 10-15 seconds of maximal effort when oxidative phosphorylation cannot meet energy demands. By buffering ATP concentrations, creatine maintains the energy charge of the cell, supporting sustained force production and delaying the onset of fatigue. In the brain, the same phosphocreatine shuttle system supports neuronal energy homeostasis, and creatine also exhibits direct antioxidant properties by scavenging reactive oxygen species.",
  },
  {
    name: "Ashwagandha",
    aliases: ["ashwagandha", "ksm-66", "ksm 66", "withania somnifera"],
    synopsis:
      "Ashwagandha (Withania somnifera) is a adaptogenic herb used for over 3,000 years in Ayurvedic medicine, classified as a Rasayana (rejuvenator). Its bioactive compounds, primarily withanolides such as withaferin A and withanolide D, are responsible for its broad pharmacological effects.",
    whatItDoes:
      "Ashwagandha significantly reduces perceived stress and anxiety, with clinical trials demonstrating reductions in serum cortisol levels of 23-30% over 60 days of supplementation. It enhances physical performance by improving VO2 max, muscular strength, and recovery, and has been shown to increase testosterone levels and improve reproductive health in men. Additionally, it supports cognitive function, particularly memory and attention, and may improve sleep quality in individuals with insomnia.",
    howItWorks:
      "Withanolides modulate the HPA axis by reducing excessive cortisol output from the adrenal glands, thereby attenuating the physiological stress response. Ashwagandha enhances GABAergic signaling, acting as a positive allosteric modulator at GABA-A receptors, which underlies its anxiolytic and sleep-promoting effects. It also inhibits NF-kB-mediated inflammatory pathways, upregulates antioxidant enzymes such as superoxide dismutase and catalase, and mimics BDNF activity to support neuroplasticity and neuroprotection.",
  },
  {
    name: "Vitamin C",
    aliases: ["vitamin c", "ascorbic acid"],
    synopsis:
      "Vitamin C (ascorbic acid) is a water-soluble essential vitamin and potent antioxidant that humans cannot synthesize due to a mutation in the gene encoding L-gulonolactone oxidase. It is required for the biosynthesis of collagen, L-carnitine, and certain neurotransmitters.",
    whatItDoes:
      "Vitamin C is essential for collagen synthesis, supporting the structural integrity of skin, blood vessels, tendons, ligaments, and bone. It enhances immune function by supporting the production and activity of white blood cells, particularly neutrophils and lymphocytes, and may reduce the duration of common colds. As a powerful antioxidant, it protects cells from oxidative damage, regenerates other antioxidants such as vitamin E, and enhances non-heme iron absorption from plant-based foods.",
    howItWorks:
      "Vitamin C serves as an electron donor for prolyl and lysyl hydroxylases, enzymes essential for the post-translational hydroxylation of proline and lysine residues in procollagen, which is necessary for stable collagen triple-helix formation. It donates electrons to various enzymatic and non-enzymatic reactions, neutralizing reactive oxygen and nitrogen species, and regenerates alpha-tocopherol (vitamin E) from its oxidized tocopheroxyl radical form. In immune cells, vitamin C accumulates to millimolar concentrations, where it enhances chemotaxis, phagocytosis, and microbial killing via enhanced superoxide production.",
  },
  {
    name: "B-Complex",
    aliases: ["b-complex", "b complex", "vitamin b", "b vitamins"],
    synopsis:
      "B-Complex supplements contain all eight essential B vitamins: B1 (thiamine), B2 (riboflavin), B3 (niacin), B5 (pantothenic acid), B6 (pyridoxine), B7 (biotin), B9 (folate), and B12 (cobalamin). These water-soluble vitamins work synergistically as coenzymes in a vast array of metabolic processes.",
    whatItDoes:
      "B vitamins are indispensable for converting food into cellular energy through their roles in glycolysis, the citric acid cycle, and oxidative phosphorylation, making them essential for combating fatigue and supporting physical performance. They are critical for nervous system health, neurotransmitter synthesis (including serotonin, dopamine, and GABA), and the maintenance of myelin sheaths around nerve fibers. B9 and B12 are particularly important for DNA synthesis, red blood cell formation, and the regulation of homocysteine levels, a risk factor for cardiovascular disease.",
    howItWorks:
      "Each B vitamin is converted to its active coenzyme form: thiamine to TPP, riboflavin to FAD and FMN, niacin to NAD+ and NADP+, pantothenic acid to coenzyme A, pyridoxine to PLP, biotin to biotinyl-AMP, folate to THF, and cobalamin to methylcobalamin and adenosylcobalamin. These coenzymes participate in hydrogen and electron transfer, one-carbon metabolism, amino acid transamination, and fatty acid synthesis and oxidation. B6 (as PLP) is the coenzyme for aromatic amino acid decarboxylase, directly governing the synthesis of serotonin from tryptophan and dopamine from L-DOPA.",
  },
  {
    name: "CoQ10",
    aliases: ["coq10", "coenzyme q10", "ubiquinol", "ubiquinone"],
    synopsis:
      "Coenzyme Q10 (CoQ10) is a fat-soluble, vitamin-like benzoquinone compound synthesized endogenously in every cell of the body, with the highest concentrations found in the heart, liver, kidneys, and pancreas. It exists in two forms: ubiquinone (oxidized) and ubiquinol (reduced, active antioxidant form).",
    whatItDoes:
      "CoQ10 is essential for mitochondrial energy production and is particularly important for organs with high metabolic demands such as the heart. It has been shown to improve symptoms of heart failure, reduce statin-induced myopathy (muscle pain), lower blood pressure, and enhance exercise capacity. As a powerful lipid-soluble antioxidant, it protects cell membranes and LDL cholesterol from oxidative damage, and may slow cellular aging and support fertility.",
    howItWorks:
      "CoQ10 functions as an essential electron carrier in the mitochondrial electron transport chain, shuttling electrons from Complex I and Complex II to Complex III, which is necessary for establishing the proton gradient that drives ATP synthase. In its reduced form (ubiquinol), it acts as a chain-breaking antioxidant in lipid membranes, donating hydrogen atoms to neutralize lipid peroxyl radicals and preventing the propagation of lipid peroxidation. CoQ10 also stabilizes the mitochondrial permeability transition pore, protecting against apoptosis, and regenerates alpha-tocopherol in LDL particles.",
  },
  {
    name: "Probiotics",
    aliases: ["probiotics", "probiotic", "lactobacillus", "bifidobacterium"],
    synopsis:
      "Probiotics are live microorganisms, primarily bacteria and yeasts, that confer a health benefit on the host when administered in adequate amounts. The most studied genera include Lactobacillus, Bifidobacterium, and the yeast Saccharomyces boulardii.",
    whatItDoes:
      "Probiotics help restore and maintain a healthy gut microbiome, improving digestive function and alleviating symptoms of irritable bowel syndrome, antibiotic-associated diarrhea, and inflammatory bowel conditions. They strengthen the intestinal epithelial barrier, reducing intestinal permeability (\"leaky gut\") and systemic inflammation. Emerging research supports their role in the gut-brain axis, with certain strains demonstrating improvements in anxiety, depression, and stress reactivity.",
    howItWorks:
      "Probiotics exert their effects through multiple mechanisms: competitive exclusion of pathogenic bacteria by competing for adhesion sites and nutrients, production of antimicrobial substances such as bacteriocins and short-chain fatty acids (SCFAs), and acidification of the colonic environment via lactic acid production. SCFAs, particularly butyrate, serve as the primary fuel for colonocytes, strengthen tight junctions between epithelial cells, and modulate immune responses by inhibiting histone deacetylases and activating GPR43/GPR109A receptors on immune cells. Probiotics also interact with gut-associated lymphoid tissue (GALT) to promote regulatory T-cell differentiation and IgA secretion.",
  },
  {
    name: "Turmeric / Curcumin",
    aliases: ["turmeric", "curcumin"],
    synopsis:
      "Curcumin is the principal bioactive polyphenol found in turmeric (Curcuma longa), responsible for the spice's characteristic yellow color. While turmeric contains only 2-5% curcumin by weight, standardized extracts concentrate this compound, and modern formulations use piperine, liposomal delivery, or phytosome technology to overcome its naturally poor bioavailability.",
    whatItDoes:
      "Curcumin is one of the most potent natural anti-inflammatory compounds, with clinical trials demonstrating efficacy comparable to certain NSAIDs for managing osteoarthritis pain and joint stiffness. It exhibits powerful antioxidant activity, supports liver detoxification, and may reduce the risk of cardiovascular disease by improving endothelial function and reducing LDL oxidation. Curcumin also shows promise in supporting cognitive health by reducing neuroinflammation and amyloid plaque accumulation, and has demonstrated antidepressant effects in clinical studies.",
    howItWorks:
      "Curcumin modulates numerous molecular targets, most notably suppressing the NF-kB signaling pathway, which is the master regulator of inflammatory gene expression, thereby reducing the production of TNF-alpha, IL-1beta, IL-6, and COX-2. It activates the Nrf2/ARE pathway, upregulating phase II detoxification enzymes and antioxidant proteins including heme oxygenase-1, glutathione S-transferase, and NAD(P)H quinone oxidoreductase. Curcumin also inhibits the NLRP3 inflammasome, modulates epigenetic machinery (histone acetyltransferases and deacetylases), and crosses the blood-brain barrier where it binds and disaggregates amyloid-beta oligomers.",
  },
  {
    name: "Melatonin",
    aliases: ["melatonin"],
    synopsis:
      "Melatonin is an endogenous neurohormone primarily synthesized and secreted by the pineal gland in response to darkness, serving as the body's principal chronobiotic signal. It is also produced in smaller quantities by the retina, gut, bone marrow, and immune cells.",
    whatItDoes:
      "Melatonin regulates the sleep-wake cycle (circadian rhythm) and is effective for reducing sleep onset latency, improving sleep quality, and mitigating jet lag and shift-work sleep disruption. It acts as a potent antioxidant, directly scavenging free radicals and stimulating the production of other antioxidant enzymes, which may confer neuroprotective benefits. Melatonin also supports immune function by enhancing the activity of natural killer cells and T-helper cells, and has been studied for its potential role in reducing inflammation and supporting healthy aging.",
    howItWorks:
      "Melatonin exerts its circadian effects by binding to MT1 and MT2 G-protein-coupled receptors in the suprachiasmatic nucleus (SCN) of the hypothalamus, the body's master clock, where MT1 activation suppresses neuronal firing to promote sleepiness and MT2 activation phase-shifts the circadian clock. As an antioxidant, melatonin and its metabolites (cyclic 3-hydroxymelatonin, AFMK, AMK) form an antioxidant cascade capable of scavenging up to 10 reactive oxygen/nitrogen species per molecule, making it more efficient than most classical antioxidants. Melatonin also stabilizes mitochondrial membranes, enhances electron transport chain efficiency, and inhibits the mitochondrial permeability transition pore opening.",
  },
  {
    name: "Iron",
    aliases: ["iron", "ferrous", "ferrous sulfate", "iron bisglycinate"],
    synopsis:
      "Iron is an essential trace mineral and a core component of hemoglobin and myoglobin, the proteins responsible for oxygen transport and storage in the blood and muscle tissue. Iron deficiency is the most common nutritional deficiency worldwide, particularly affecting women of reproductive age, endurance athletes, and individuals on plant-based diets.",
    whatItDoes:
      "Iron is fundamental to oxygen delivery throughout the body, and adequate iron status is critical for preventing anemia, which manifests as fatigue, weakness, cognitive impairment, and exercise intolerance. It supports energy metabolism as a component of cytochrome enzymes in the electron transport chain, and is required for DNA synthesis and cell proliferation. Iron also plays important roles in immune function, neurotransmitter synthesis (dopamine, serotonin, norepinephrine), and myelin production in the developing brain.",
    howItWorks:
      "Iron is absorbed in the duodenum as ferrous iron (Fe2+) via the divalent metal transporter 1 (DMT1) or as heme iron via heme carrier protein 1, then exported into circulation by ferroportin and bound to transferrin for systemic delivery. Inside cells, iron is incorporated into heme groups (for hemoglobin, myoglobin, and cytochromes) or iron-sulfur clusters (for mitochondrial electron transport complexes I, II, and III). Iron homeostasis is tightly regulated by the peptide hormone hepcidin, which degrades ferroportin to control intestinal absorption and macrophage iron recycling, preventing both deficiency and toxic iron overload.",
  },
  {
    name: "Calcium",
    aliases: ["calcium", "calcium citrate", "calcium carbonate"],
    synopsis:
      "Calcium is the most abundant mineral in the human body, with approximately 99% stored in bones and teeth as hydroxyapatite crystals, and the remaining 1% circulating in blood and soft tissues where it serves critical signaling functions. It is an essential nutrient obtained through dairy products, leafy greens, fortified foods, and supplementation.",
    whatItDoes:
      "Calcium is essential for building and maintaining strong bones and teeth, and adequate intake throughout life reduces the risk of osteoporosis and fractures, particularly when combined with vitamin D. The ionized calcium in blood and intracellular fluid is indispensable for muscle contraction, nerve impulse transmission, blood clotting, and hormone secretion. Sufficient calcium intake also supports healthy blood pressure regulation and may reduce the risk of colorectal cancer.",
    howItWorks:
      "Calcium absorption occurs primarily in the duodenum via the active transcellular pathway mediated by TRPV6 calcium channels and calbindin-D9k, a process dependent on 1,25-dihydroxyvitamin D, and passively throughout the small intestine via paracellular diffusion. Intracellularly, calcium acts as a ubiquitous second messenger: upon release from the sarcoplasmic reticulum or entry through voltage-gated channels, it binds troponin C to initiate muscle contraction, activates calmodulin-dependent kinases for signal transduction, and triggers synaptic vesicle fusion for neurotransmitter release. Serum calcium is maintained within a narrow range (8.5-10.5 mg/dL) by the coordinated actions of parathyroid hormone, calcitonin, and calcitriol acting on bone, kidney, and intestine.",
  },
  {
    name: "Collagen",
    aliases: ["collagen", "collagen peptides", "hydrolyzed collagen"],
    synopsis:
      "Collagen is the most abundant protein in the human body, comprising approximately 30% of total protein mass and forming the structural scaffold of skin, bones, tendons, ligaments, cartilage, and blood vessels. Hydrolyzed collagen (collagen peptides) are enzymatically broken down into bioavailable di- and tripeptides for efficient absorption.",
    whatItDoes:
      "Collagen supplementation has been shown to improve skin elasticity, hydration, and dermal collagen density, reducing the appearance of wrinkles and supporting skin aging. It supports joint health by stimulating chondrocyte metabolism and has demonstrated reductions in joint pain in athletes and individuals with osteoarthritis. Collagen peptides also strengthen hair and nails, support gut lining integrity, and contribute to bone mineral density when combined with calcium and vitamin D.",
    howItWorks:
      "After ingestion, hydrolyzed collagen is broken down in the gastrointestinal tract into bioactive di- and tripeptides, particularly hydroxyproline-proline and hydroxyproline-glycine, which resist further digestion and are absorbed intact into the bloodstream. These peptides accumulate in target tissues such as skin and cartilage, where they act as ligands for fibroblast and chondrocyte receptors, stimulating endogenous collagen synthesis, hyaluronic acid production, and elastin expression. The hydroxyproline-containing peptides also serve as chemotactic signals that recruit fibroblasts to sites of tissue remodeling, directly linking supplementation to enhanced connective tissue turnover.",
  },
  {
    name: "NAC",
    aliases: ["nac", "n-acetyl cysteine", "n-acetylcysteine"],
    synopsis:
      "N-Acetyl Cysteine (NAC) is the acetylated form of the amino acid L-cysteine and serves as the rate-limiting precursor for the synthesis of glutathione, the body's most important intracellular antioxidant. It has been used clinically for decades as a mucolytic agent and as the standard antidote for acetaminophen (paracetamol) overdose.",
    whatItDoes:
      "NAC replenishes intracellular glutathione stores, providing robust antioxidant and detoxification support, and is used clinically to protect the liver from drug-induced and toxin-induced damage. It has mucolytic properties, thinning mucus by breaking disulfide bonds in mucoproteins, which makes it beneficial for respiratory conditions such as COPD and chronic bronchitis. NAC also shows promise in psychiatric applications, with studies demonstrating benefits for obsessive-compulsive disorder, addiction, and depression through modulation of glutamate signaling.",
    howItWorks:
      "NAC is deacetylated to L-cysteine, which is the rate-limiting substrate for glutathione synthesis via the sequential action of glutamate-cysteine ligase and glutathione synthetase. Glutathione (GSH) neutralizes reactive oxygen species directly and serves as a cofactor for glutathione peroxidase and glutathione S-transferase, which detoxify peroxides and conjugate electrophilic xenobiotics for excretion. NAC also modulates the cystine-glutamate antiporter (system Xc-), increasing extracellular glutamate in the nucleus accumbens, which activates inhibitory mGluR2/3 presynaptic autoreceptors to reduce excessive glutamatergic neurotransmission associated with addictive and compulsive behaviors.",
  },
  {
    name: "Vitamin K2",
    aliases: ["vitamin k2", "k2", "mk-7", "mk7", "menaquinone"],
    synopsis:
      "Vitamin K2 (menaquinone) is a fat-soluble vitamin distinct from K1 (phylloquinone) that plays essential roles in calcium metabolism and cardiovascular health. The MK-7 subtype, derived from bacterial fermentation (notably in natto), has a significantly longer half-life than MK-4, providing sustained biological activity.",
    whatItDoes:
      "Vitamin K2 directs calcium to the bones and teeth where it is needed while preventing its pathological deposition in arteries, kidneys, and soft tissues, a process critical for both skeletal and cardiovascular health. It activates osteocalcin to promote bone mineralization, reducing fracture risk, and activates matrix Gla protein (MGP) to inhibit arterial calcification. K2 works synergistically with vitamin D3, as D3 increases the production of K2-dependent proteins, making co-supplementation particularly effective.",
    howItWorks:
      "Vitamin K2 serves as an essential cofactor for the enzyme gamma-glutamyl carboxylase, which converts specific glutamic acid residues to gamma-carboxyglutamic acid (Gla) residues in vitamin K-dependent proteins. This carboxylation activates osteocalcin, enabling it to bind calcium and incorporate it into the hydroxyapatite matrix of bone, and activates matrix Gla protein (MGP), the most potent known inhibitor of vascular calcification, which sequesters calcium in arterial walls. The vitamin K cycle (vitamin K epoxide reductase pathway) regenerates the reduced hydroquinone form of K2 after each carboxylation event, allowing each molecule to participate in multiple carboxylation reactions.",
  },
  {
    name: "Alpha Lipoic Acid",
    aliases: ["alpha lipoic acid", "ala", "lipoic acid"],
    synopsis:
      "Alpha-lipoic acid (ALA) is a sulfur-containing organothiol compound naturally synthesized in mitochondria and unique among antioxidants in being both water- and fat-soluble, allowing it to function in every compartment of the cell. It exists in two enantiomeric forms, with R-lipoic acid being the biologically active isomer produced endogenously.",
    whatItDoes:
      "Alpha-lipoic acid is a universal antioxidant that regenerates other antioxidants including vitamins C and E, glutathione, and CoQ10, amplifying the body's total antioxidant defense network. It has demonstrated significant clinical benefit for diabetic peripheral neuropathy, reducing symptoms of pain, burning, and numbness, and improves insulin sensitivity by enhancing glucose uptake in skeletal muscle. ALA also supports liver health, chelates heavy metals such as mercury and arsenic, and may protect against age-related cognitive decline.",
    howItWorks:
      "ALA functions as an essential cofactor for mitochondrial alpha-keto acid dehydrogenase complexes (pyruvate dehydrogenase and alpha-ketoglutarate dehydrogenase), linking glycolysis to the citric acid cycle and directly supporting cellular energy production. In its reduced form (dihydrolipoic acid, DHLA), it forms a potent redox couple capable of reducing oxidized glutathione (GSSG) back to GSH, regenerating ascorbate from dehydroascorbate, and reducing ubiquinone to ubiquinol. ALA also activates AMPK (AMP-activated protein kinase), which stimulates GLUT4 translocation to the cell membrane to enhance glucose uptake, and chelates transition metals (Fe2+, Cu2+) that would otherwise catalyze Fenton chemistry and generate hydroxyl radicals.",
  },
];

export function findSupplementInfo(name: string): SupplementInfo | null {
  const lower = name.toLowerCase().trim();
  return (
    SUPPLEMENT_DATA.find(
      (s) =>
        s.name.toLowerCase() === lower ||
        s.aliases.some((a) => lower.includes(a) || a.includes(lower))
    ) || null
  );
}

export default SUPPLEMENT_DATA;
