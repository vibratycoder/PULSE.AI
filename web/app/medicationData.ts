/**
 * Medication data bank — reference information for a wide variety of medications.
 *
 * Each entry includes a brief synopsis (what the medication is),
 * what it does (therapeutic effects), and how it works (mechanism of action).
 */

export interface MedicationInfo {
  name: string;
  aliases: string[];
  synopsis: string;
  whatItDoes: string;
  howItWorks: string;
}

const MEDICATION_DATA: MedicationInfo[] = [
  // ── Cardiovascular ──
  {
    name: "Lisinopril",
    aliases: ["lisinopril", "zestril", "prinivil"],
    synopsis:
      "An ACE inhibitor commonly prescribed for high blood pressure and heart failure. One of the most widely used blood pressure medications worldwide.",
    whatItDoes:
      "Lowers blood pressure, reduces strain on the heart, and helps protect the kidneys — especially in diabetic patients. Also improves survival after heart attacks.",
    howItWorks:
      "Blocks the angiotensin-converting enzyme (ACE), which prevents the formation of angiotensin II — a potent vasoconstrictor. This causes blood vessels to relax and widen, reducing blood pressure and cardiac workload.",
  },
  {
    name: "Amlodipine",
    aliases: ["amlodipine", "norvasc"],
    synopsis:
      "A long-acting calcium channel blocker used to treat high blood pressure and chest pain (angina). Known for its smooth, gradual onset and once-daily dosing.",
    whatItDoes:
      "Lowers blood pressure steadily over 24 hours and reduces the frequency and severity of angina episodes. Can be used alone or combined with other blood pressure medications.",
    howItWorks:
      "Blocks L-type calcium channels in vascular smooth muscle, preventing calcium from entering cells. This relaxes and widens blood vessels, reducing peripheral resistance and lowering blood pressure.",
  },
  {
    name: "Losartan",
    aliases: ["losartan", "cozaar"],
    synopsis:
      "An angiotensin II receptor blocker (ARB) used for high blood pressure, diabetic kidney disease, and stroke prevention. Often prescribed as an alternative when ACE inhibitors cause a dry cough.",
    whatItDoes:
      "Lowers blood pressure, protects the kidneys from damage in type 2 diabetes, and reduces the risk of stroke in patients with an enlarged heart.",
    howItWorks:
      "Blocks angiotensin II from binding to AT1 receptors on blood vessels and adrenal glands. Unlike ACE inhibitors, it does not affect bradykinin breakdown, which is why it rarely causes a cough.",
  },
  {
    name: "Metoprolol",
    aliases: ["metoprolol", "lopressor", "toprol", "toprol-xl"],
    synopsis:
      "A selective beta-1 blocker available in immediate-release (tartrate) and extended-release (succinate) forms. A cornerstone medication for heart conditions.",
    whatItDoes:
      "Slows the heart rate, lowers blood pressure, and reduces the heart's workload. Used to treat high blood pressure, chest pain, heart failure, and to prevent future heart attacks.",
    howItWorks:
      "Selectively blocks beta-1 adrenergic receptors in the heart, reducing the effects of adrenaline. This decreases heart rate, contractility, and oxygen demand. At higher doses, may also block beta-2 receptors.",
  },
  {
    name: "Atenolol",
    aliases: ["atenolol", "tenormin"],
    synopsis:
      "A cardioselective beta-blocker used for high blood pressure, angina, and certain heart rhythm disorders. Water-soluble, so it does not cross the blood-brain barrier as easily as other beta-blockers.",
    whatItDoes:
      "Reduces heart rate and blood pressure. Decreases the frequency of angina attacks and helps control certain arrhythmias.",
    howItWorks:
      "Selectively blocks beta-1 receptors in the heart, lowering heart rate and cardiac output. Its hydrophilic nature means fewer central nervous system side effects like fatigue and depression compared to lipophilic beta-blockers.",
  },
  {
    name: "Carvedilol",
    aliases: ["carvedilol", "coreg"],
    synopsis:
      "A non-selective beta-blocker with additional alpha-1 blocking activity. Provides both heart rate reduction and blood vessel relaxation — proven to improve survival in heart failure.",
    whatItDoes:
      "Treats heart failure (proven mortality benefit), high blood pressure, and left ventricular dysfunction after heart attack. Reduces hospitalizations in heart failure patients.",
    howItWorks:
      "Blocks beta-1 and beta-2 adrenergic receptors (reducing heart rate and contractility) and alpha-1 adrenergic receptors (relaxing blood vessels). This dual mechanism lowers blood pressure through two pathways simultaneously.",
  },
  {
    name: "Hydrochlorothiazide",
    aliases: ["hydrochlorothiazide", "hctz", "microzide"],
    synopsis:
      "A thiazide diuretic and one of the oldest and most commonly prescribed blood pressure medications. Often used in combination with other antihypertensives.",
    whatItDoes:
      "Lowers blood pressure by reducing fluid volume. Also used to treat edema (swelling) associated with heart failure, liver cirrhosis, and kidney disorders.",
    howItWorks:
      "Inhibits sodium and chloride reabsorption in the distal convoluted tubule of the kidney. This increases urine output, reducing blood volume and thereby lowering blood pressure. Long-term effects also include vasodilation.",
  },
  {
    name: "Furosemide",
    aliases: ["furosemide", "lasix"],
    synopsis:
      "A powerful loop diuretic used when rapid or significant fluid removal is needed. Much stronger than thiazide diuretics.",
    whatItDoes:
      "Rapidly removes excess fluid from the body, relieving swelling in the legs, ankles, and lungs. Used in heart failure, kidney disease, and liver cirrhosis.",
    howItWorks:
      "Blocks the sodium-potassium-chloride cotransporter (NKCC2) in the thick ascending loop of Henle in the kidneys. This prevents reabsorption of sodium and water, producing a strong diuretic effect within 30-60 minutes of oral dosing.",
  },
  {
    name: "Spironolactone",
    aliases: ["spironolactone", "aldactone"],
    synopsis:
      "A potassium-sparing diuretic and aldosterone antagonist. Also has anti-androgen effects, making it useful for hormonal acne and hirsutism in women.",
    whatItDoes:
      "Treats heart failure, resistant hypertension, fluid retention, and hyperaldosteronism. Also used off-label for hormonal acne, hirsutism, and as part of transgender hormone therapy.",
    howItWorks:
      "Competitively blocks aldosterone receptors in the kidneys, preventing sodium reabsorption and potassium excretion. Also blocks androgen receptors and inhibits androgen synthesis, which accounts for its anti-androgenic effects.",
  },
  {
    name: "Warfarin",
    aliases: ["warfarin", "coumadin", "jantoven"],
    synopsis:
      "An oral anticoagulant (blood thinner) that has been used for decades to prevent blood clots. Requires regular blood monitoring (INR tests) and has many food and drug interactions.",
    whatItDoes:
      "Prevents blood clots from forming or growing larger. Used to prevent stroke in atrial fibrillation, treat deep vein thrombosis and pulmonary embolism, and protect mechanical heart valve patients.",
    howItWorks:
      "Inhibits vitamin K epoxide reductase, blocking the recycling of vitamin K. This reduces the liver's ability to produce clotting factors II, VII, IX, and X, slowing the blood's ability to clot. Effects take 3-5 days to fully develop.",
  },
  {
    name: "Apixaban",
    aliases: ["apixaban", "eliquis"],
    synopsis:
      "A direct oral anticoagulant (DOAC) that has largely replaced warfarin for many patients. Does not require routine blood monitoring or dietary restrictions.",
    whatItDoes:
      "Prevents blood clots and stroke in patients with atrial fibrillation. Also treats and prevents deep vein thrombosis and pulmonary embolism.",
    howItWorks:
      "Directly inhibits Factor Xa, a key enzyme in the coagulation cascade. Unlike warfarin, it has a predictable dose-response and does not require vitamin K monitoring.",
  },
  {
    name: "Rivaroxaban",
    aliases: ["rivaroxaban", "xarelto"],
    synopsis:
      "A direct oral anticoagulant (DOAC) that inhibits Factor Xa. Once-daily dosing for most indications. The first DOAC approved for multiple cardiovascular indications.",
    whatItDoes:
      "Prevents stroke in atrial fibrillation, treats and prevents DVT and pulmonary embolism, and reduces cardiovascular risk in patients with coronary or peripheral artery disease.",
    howItWorks:
      "Directly and selectively binds to Factor Xa (both free and clot-bound), blocking the conversion of prothrombin to thrombin. This interrupts the coagulation cascade without affecting existing clots but preventing new clot formation.",
  },
  {
    name: "Clopidogrel",
    aliases: ["clopidogrel", "plavix"],
    synopsis:
      "An antiplatelet medication used to prevent blood clots in patients with recent heart attacks, strokes, or peripheral artery disease. Often prescribed after stent placement.",
    whatItDoes:
      "Prevents platelets from clumping together to form clots. Reduces the risk of heart attack and stroke in at-risk patients.",
    howItWorks:
      "Irreversibly blocks the P2Y12 ADP receptor on platelets, preventing platelet activation and aggregation. It is a prodrug that must be converted to its active form by liver enzymes (CYP2C19).",
  },
  {
    name: "Aspirin",
    aliases: ["aspirin", "asa", "acetylsalicylic acid", "bayer"],
    synopsis:
      "One of the oldest medications still in widespread use — an NSAID with unique antiplatelet properties at low doses. Available over-the-counter.",
    whatItDoes:
      "At standard doses: relieves pain, reduces inflammation, and lowers fever. At low doses (81mg): prevents blood clots, reducing the risk of heart attack and stroke in at-risk patients.",
    howItWorks:
      "Irreversibly inhibits cyclooxygenase enzymes (COX-1 and COX-2). COX-1 inhibition in platelets blocks thromboxane A2 production, preventing platelet aggregation. Since platelets cannot make new COX, a single dose affects them for their entire 7-10 day lifespan.",
  },
  {
    name: "Atorvastatin",
    aliases: ["atorvastatin", "lipitor"],
    synopsis:
      "The most widely prescribed statin medication for lowering cholesterol. One of the most commonly used drugs in the world.",
    whatItDoes:
      "Significantly lowers LDL ('bad') cholesterol, moderately lowers triglycerides, and slightly raises HDL ('good') cholesterol. Reduces the risk of heart attack, stroke, and cardiovascular death.",
    howItWorks:
      "Inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis in the liver. This forces the liver to pull more LDL cholesterol from the bloodstream by upregulating LDL receptors.",
  },
  {
    name: "Rosuvastatin",
    aliases: ["rosuvastatin", "crestor"],
    synopsis:
      "A potent statin considered one of the most effective at lowering LDL cholesterol. Often chosen when aggressive cholesterol lowering is needed.",
    whatItDoes:
      "Produces the largest LDL reductions among statins (up to 55%). Also improves the LDL/HDL ratio and reduces cardiovascular events.",
    howItWorks:
      "Inhibits HMG-CoA reductase with high affinity. Its hydrophilic nature gives it liver selectivity, potentially resulting in fewer muscle-related side effects compared to lipophilic statins.",
  },
  {
    name: "Simvastatin",
    aliases: ["simvastatin", "zocor"],
    synopsis:
      "A moderate-intensity statin derived from a natural compound found in red yeast rice. Available generically and widely used for cholesterol management.",
    whatItDoes:
      "Lowers LDL cholesterol by 30-40% and reduces the risk of cardiovascular events. Also modestly raises HDL cholesterol.",
    howItWorks:
      "A prodrug that is converted in the liver to its active form, which inhibits HMG-CoA reductase. Has notable drug interactions — particularly with certain antibiotics and antifungals — due to CYP3A4 metabolism.",
  },
  {
    name: "Ezetimibe",
    aliases: ["ezetimibe", "zetia"],
    synopsis:
      "A cholesterol absorption inhibitor that works in the intestine rather than the liver. Often combined with statins for additional cholesterol lowering.",
    whatItDoes:
      "Lowers LDL cholesterol by 15-20% when used alone, and provides additional lowering when added to a statin. Reduces cardiovascular events when combined with statin therapy.",
    howItWorks:
      "Blocks the Niemann-Pick C1-Like 1 (NPC1L1) protein on the brush border of the small intestine, preventing cholesterol absorption from food and bile. This complements statins, which reduce cholesterol production.",
  },
  {
    name: "Digoxin",
    aliases: ["digoxin", "lanoxin"],
    synopsis:
      "A cardiac glycoside derived from the foxglove plant. One of the oldest cardiac medications still in use, with a narrow therapeutic window requiring blood level monitoring.",
    whatItDoes:
      "Strengthens heart contractions and slows heart rate. Used in heart failure to improve symptoms and in atrial fibrillation to control ventricular rate.",
    howItWorks:
      "Inhibits the sodium-potassium ATPase pump in cardiac cells. This increases intracellular sodium, which in turn increases intracellular calcium via the sodium-calcium exchanger, leading to stronger heart muscle contractions (positive inotropic effect). Vagal stimulation slows conduction through the AV node.",
  },

  // ── Diabetes ──
  {
    name: "Metformin",
    aliases: ["metformin", "glucophage", "glucophage xr"],
    synopsis:
      "The first-line oral medication for type 2 diabetes and one of the most prescribed drugs globally. Has been used for over 60 years with an excellent safety record.",
    whatItDoes:
      "Lowers blood sugar levels, improves insulin sensitivity, and may promote modest weight loss. Also reduces the risk of diabetes-related complications.",
    howItWorks:
      "Primarily reduces glucose production by the liver by activating AMP-activated protein kinase (AMPK). Also improves insulin sensitivity in muscle tissue and slows intestinal glucose absorption. Does not cause hypoglycemia when used alone.",
  },
  {
    name: "Glipizide",
    aliases: ["glipizide", "glucotrol"],
    synopsis:
      "A sulfonylurea medication used to lower blood sugar in type 2 diabetes. Works by stimulating the pancreas to produce more insulin.",
    whatItDoes:
      "Reduces blood sugar levels by increasing insulin secretion. Typically lowers HbA1c by 1-2%. Taken before meals for best effect.",
    howItWorks:
      "Binds to sulfonylurea receptors (SUR1) on pancreatic beta cells, closing ATP-sensitive potassium channels. This depolarizes the cell membrane, triggering calcium influx and insulin release. Requires functioning beta cells to work.",
  },
  {
    name: "Glyburide",
    aliases: ["glyburide", "glibenclamide", "diabeta", "micronase"],
    synopsis:
      "A long-acting sulfonylurea for type 2 diabetes. More potent than glipizide but carries a higher risk of hypoglycemia, especially in elderly patients.",
    whatItDoes:
      "Stimulates insulin release from the pancreas to lower blood sugar throughout the day. Provides sustained blood sugar control with once or twice daily dosing.",
    howItWorks:
      "Binds to sulfonylurea receptors on pancreatic beta cells with higher affinity than other sulfonylureas, producing a longer duration of insulin secretion. Also has mild extrapancreatic effects improving peripheral glucose utilization.",
  },
  {
    name: "Insulin Glargine",
    aliases: ["insulin glargine", "lantus", "basaglar", "toujeo", "glargine"],
    synopsis:
      "A long-acting basal insulin analog used in both type 1 and type 2 diabetes. Provides a steady, peakless insulin level over approximately 24 hours.",
    whatItDoes:
      "Provides a background level of insulin to control blood sugar between meals and overnight. Reduces fasting blood glucose and HbA1c levels.",
    howItWorks:
      "Modified insulin molecule that forms microprecipitates at the neutral pH of subcutaneous tissue, creating a depot that slowly releases insulin. The amino acid modifications shift the isoelectric point, causing precipitation and slow absorption.",
  },
  {
    name: "Insulin Lispro",
    aliases: ["insulin lispro", "humalog", "admelog", "lispro"],
    synopsis:
      "A rapid-acting insulin analog used to control blood sugar spikes after meals. One of the most commonly used mealtime insulins.",
    whatItDoes:
      "Quickly lowers blood sugar after eating. Begins working within 15 minutes, peaks at 1-2 hours, and lasts 3-5 hours. Allows flexible mealtime dosing.",
    howItWorks:
      "A modified insulin molecule where the lysine and proline residues at positions B28 and B29 are reversed. This prevents insulin from forming hexamers, allowing faster absorption from the injection site compared to regular insulin.",
  },
  {
    name: "Empagliflozin",
    aliases: ["empagliflozin", "jardiance"],
    synopsis:
      "An SGLT2 inhibitor used for type 2 diabetes that has shown significant cardiovascular and kidney benefits beyond blood sugar control.",
    whatItDoes:
      "Lowers blood sugar, promotes weight loss (2-3 kg), lowers blood pressure, and reduces the risk of cardiovascular death and heart failure hospitalization. Also slows kidney disease progression.",
    howItWorks:
      "Blocks the sodium-glucose cotransporter 2 (SGLT2) in the proximal tubule of the kidneys. This prevents the reabsorption of filtered glucose, causing excess glucose to be excreted in the urine (glucosuria).",
  },
  {
    name: "Dapagliflozin",
    aliases: ["dapagliflozin", "farxiga"],
    synopsis:
      "An SGLT2 inhibitor approved for type 2 diabetes, heart failure, and chronic kidney disease — one of the first diabetes drugs with indications beyond blood sugar control.",
    whatItDoes:
      "Lowers blood sugar, reduces heart failure hospitalizations, and slows progression of chronic kidney disease. Also promotes modest weight loss and blood pressure reduction.",
    howItWorks:
      "Selectively inhibits SGLT2 in the kidneys, reducing glucose reabsorption and causing glycosuria. Also has natriuretic (sodium-excreting) effects that contribute to blood pressure lowering and cardiac benefits through reduced preload.",
  },
  {
    name: "Semaglutide",
    aliases: ["semaglutide", "ozempic", "wegovy", "rybelsus"],
    synopsis:
      "A GLP-1 receptor agonist available as a weekly injection (Ozempic/Wegovy) or daily oral tablet (Rybelsus). Used for type 2 diabetes and chronic weight management.",
    whatItDoes:
      "Lowers blood sugar, promotes significant weight loss (up to 15% of body weight), reduces cardiovascular risk, and decreases appetite. One of the most effective medications for both diabetes and obesity.",
    howItWorks:
      "Mimics the incretin hormone GLP-1, which stimulates insulin secretion, suppresses glucagon, slows gastric emptying, and acts on brain appetite centers to reduce hunger. A fatty acid side chain allows it to bind to albumin, extending its half-life to about one week.",
  },
  {
    name: "Liraglutide",
    aliases: ["liraglutide", "victoza", "saxenda"],
    synopsis:
      "A once-daily GLP-1 receptor agonist for type 2 diabetes (Victoza) and weight management (Saxenda). The predecessor to semaglutide with well-established cardiovascular safety data.",
    whatItDoes:
      "Lowers blood sugar, promotes weight loss, and reduces cardiovascular events in type 2 diabetes patients with established heart disease.",
    howItWorks:
      "Activates GLP-1 receptors, enhancing glucose-dependent insulin secretion and suppressing glucagon. A fatty acid modification allows albumin binding, extending its half-life to ~13 hours for once-daily dosing.",
  },
  {
    name: "Sitagliptin",
    aliases: ["sitagliptin", "januvia"],
    synopsis:
      "A DPP-4 inhibitor used to manage type 2 diabetes. Well-tolerated with a low risk of hypoglycemia and weight-neutral effects.",
    whatItDoes:
      "Modestly lowers blood sugar by enhancing the body's natural incretin system. Typically reduces HbA1c by 0.5-0.8%. Weight-neutral and well-tolerated.",
    howItWorks:
      "Inhibits dipeptidyl peptidase-4 (DPP-4), the enzyme that breaks down incretin hormones (GLP-1 and GIP). This prolongs incretin activity, leading to increased insulin release and decreased glucagon secretion in a glucose-dependent manner.",
  },
  {
    name: "Pioglitazone",
    aliases: ["pioglitazone", "actos"],
    synopsis:
      "A thiazolidinedione (TZD) that improves insulin sensitivity. Particularly effective for patients with significant insulin resistance.",
    whatItDoes:
      "Improves insulin sensitivity throughout the body, lowers blood sugar, and may reduce fatty liver. Can cause fluid retention and weight gain.",
    howItWorks:
      "Activates peroxisome proliferator-activated receptor gamma (PPAR-gamma), a nuclear receptor that regulates genes involved in glucose and fat metabolism. Enhances insulin action in adipose tissue, muscle, and liver.",
  },

  // ── Pain & Inflammation ──
  {
    name: "Ibuprofen",
    aliases: ["ibuprofen", "advil", "motrin"],
    synopsis:
      "A nonsteroidal anti-inflammatory drug (NSAID) available over-the-counter. One of the most commonly used pain relievers and anti-inflammatory medications worldwide.",
    whatItDoes:
      "Relieves pain, reduces inflammation, and lowers fever. Effective for headaches, muscle aches, dental pain, menstrual cramps, and arthritis.",
    howItWorks:
      "Non-selectively inhibits cyclooxygenase enzymes (COX-1 and COX-2), blocking the production of prostaglandins — chemicals that promote inflammation, pain, and fever. COX-1 inhibition is responsible for gastrointestinal side effects.",
  },
  {
    name: "Acetaminophen",
    aliases: ["acetaminophen", "tylenol", "paracetamol"],
    synopsis:
      "One of the most widely used pain relievers and fever reducers globally. Available over-the-counter and found in many combination products. Unlike NSAIDs, it has minimal anti-inflammatory effects.",
    whatItDoes:
      "Relieves mild to moderate pain and reduces fever. Used for headaches, toothaches, muscle aches, colds, and flu. Safer for the stomach than NSAIDs but can cause liver damage in overdose.",
    howItWorks:
      "Its exact mechanism is not fully understood. Believed to inhibit COX enzymes in the central nervous system (brain and spinal cord) rather than peripherally, which is why it reduces pain and fever but has little anti-inflammatory effect. May also involve the endocannabinoid system.",
  },
  {
    name: "Naproxen",
    aliases: ["naproxen", "aleve", "naprosyn", "anaprox"],
    synopsis:
      "A long-acting NSAID available both over-the-counter and by prescription. Its 12-hour duration means fewer daily doses compared to ibuprofen.",
    whatItDoes:
      "Provides long-lasting relief of pain, inflammation, and fever. Commonly used for arthritis, tendinitis, bursitis, gout, and menstrual pain.",
    howItWorks:
      "Inhibits both COX-1 and COX-2 enzymes, reducing prostaglandin synthesis. Has a longer half-life (12-17 hours) than ibuprofen, providing extended anti-inflammatory and analgesic effects.",
  },
  {
    name: "Celecoxib",
    aliases: ["celecoxib", "celebrex"],
    synopsis:
      "A selective COX-2 inhibitor NSAID designed to reduce pain and inflammation with less risk of stomach ulcers compared to traditional NSAIDs.",
    whatItDoes:
      "Treats pain and inflammation from osteoarthritis, rheumatoid arthritis, and acute pain. Lower GI bleeding risk than non-selective NSAIDs.",
    howItWorks:
      "Selectively blocks cyclooxygenase-2 (COX-2), which produces inflammatory prostaglandins, while largely sparing COX-1, which produces protective prostaglandins in the stomach lining. This selectivity reduces gastrointestinal side effects.",
  },
  {
    name: "Meloxicam",
    aliases: ["meloxicam", "mobic"],
    synopsis:
      "A preferentially COX-2 selective NSAID with once-daily dosing. Commonly prescribed for arthritis with somewhat lower GI risk than traditional NSAIDs.",
    whatItDoes:
      "Treats osteoarthritis, rheumatoid arthritis, and juvenile rheumatoid arthritis. Provides anti-inflammatory and analgesic effects with convenient once-daily dosing.",
    howItWorks:
      "Preferentially inhibits COX-2 over COX-1 (though not as selectively as celecoxib). This provides anti-inflammatory effects while producing fewer GI side effects than non-selective NSAIDs like ibuprofen or naproxen.",
  },
  {
    name: "Gabapentin",
    aliases: ["gabapentin", "neurontin", "gralise"],
    synopsis:
      "An anticonvulsant widely used off-label for nerve pain (neuropathy). Originally developed for epilepsy but now more commonly prescribed for pain conditions.",
    whatItDoes:
      "Reduces nerve pain, particularly diabetic neuropathy, postherpetic neuralgia (shingles pain), and fibromyalgia. Also used for restless legs syndrome and anxiety.",
    howItWorks:
      "Binds to the alpha-2-delta subunit of voltage-gated calcium channels in the central nervous system. This reduces calcium influx and the release of excitatory neurotransmitters like glutamate, norepinephrine, and substance P, dampening pain signaling.",
  },
  {
    name: "Pregabalin",
    aliases: ["pregabalin", "lyrica"],
    synopsis:
      "A more potent successor to gabapentin, FDA-approved for nerve pain, fibromyalgia, and epilepsy. Has more predictable absorption and dosing compared to gabapentin.",
    whatItDoes:
      "Treats neuropathic pain, fibromyalgia, and partial seizures. Provides anxiety relief in some countries (approved for generalized anxiety disorder in Europe). More consistent effects than gabapentin.",
    howItWorks:
      "Binds with higher affinity to the alpha-2-delta subunit of voltage-gated calcium channels compared to gabapentin. Reduces excitatory neurotransmitter release, modulating pain and seizure activity. Has linear absorption, unlike gabapentin's saturable absorption.",
  },
  {
    name: "Tramadol",
    aliases: ["tramadol", "ultram", "conzip"],
    synopsis:
      "A centrally-acting synthetic opioid analgesic with a dual mechanism of action. Classified as a Schedule IV controlled substance — lower abuse potential than other opioids but still carries risk.",
    whatItDoes:
      "Treats moderate to moderately severe pain. Weaker than traditional opioids but effective for chronic pain conditions where NSAIDs are insufficient.",
    howItWorks:
      "Has two mechanisms: (1) weak mu-opioid receptor agonism, and (2) inhibits reuptake of serotonin and norepinephrine, similar to certain antidepressants. This dual action provides analgesic effects through both opioid and non-opioid pathways.",
  },
  {
    name: "Morphine",
    aliases: ["morphine", "ms contin", "kadian"],
    synopsis:
      "The prototypical opioid analgesic and the standard against which all other opioids are compared. Used for severe acute and chronic pain. A Schedule II controlled substance.",
    whatItDoes:
      "Provides powerful pain relief for severe pain, such as post-surgical pain, cancer pain, and acute injuries. Also reduces the sensation of breathlessness in end-of-life care.",
    howItWorks:
      "Binds to mu-opioid receptors in the brain, spinal cord, and peripheral tissues. This activates descending inhibitory pain pathways, reduces the perception of pain, and alters the emotional response to pain. Also stimulates the brain's reward system, which underlies its addictive potential.",
  },
  {
    name: "Oxycodone",
    aliases: ["oxycodone", "oxycontin", "percocet", "roxicodone"],
    synopsis:
      "A semi-synthetic opioid used for moderate to severe pain. Available alone or combined with acetaminophen (Percocet). A Schedule II controlled substance with significant abuse potential.",
    whatItDoes:
      "Provides potent pain relief approximately 1.5 times stronger than morphine when taken orally. Used for acute pain, post-surgical pain, and chronic pain when other treatments are inadequate.",
    howItWorks:
      "Primarily activates mu-opioid receptors, with some kappa-opioid receptor activity. Metabolized by CYP2D6 to oxymorphone (a more potent metabolite). Genetic variations in CYP2D6 can significantly affect individual response.",
  },
  {
    name: "Hydrocodone",
    aliases: ["hydrocodone", "vicodin", "norco", "lortab"],
    synopsis:
      "A semi-synthetic opioid typically combined with acetaminophen. The most prescribed opioid in the United States. A Schedule II controlled substance.",
    whatItDoes:
      "Treats moderate to moderately severe pain and suppresses cough. Commonly prescribed after dental procedures, injuries, and surgeries.",
    howItWorks:
      "Activates mu-opioid receptors in the brain and spinal cord. Metabolized by CYP2D6 to hydromorphone, a more potent active metabolite. Also acts on cough centers in the medulla to suppress the cough reflex.",
  },

  // ── Mental Health ──
  {
    name: "Sertraline",
    aliases: ["sertraline", "zoloft"],
    synopsis:
      "One of the most prescribed selective serotonin reuptake inhibitors (SSRIs). First-line treatment for depression and several anxiety disorders.",
    whatItDoes:
      "Treats major depression, panic disorder, social anxiety disorder, PTSD, OCD, and premenstrual dysphoric disorder. Takes 4-6 weeks for full therapeutic effect.",
    howItWorks:
      "Selectively blocks the serotonin transporter (SERT) in the synaptic cleft, preventing the reuptake of serotonin into the presynaptic neuron. This increases serotonin availability in the synapse, which over time leads to downstream receptor adaptations that improve mood.",
  },
  {
    name: "Escitalopram",
    aliases: ["escitalopram", "lexapro"],
    synopsis:
      "The most selective SSRI available, and the active enantiomer of citalopram. Known for good tolerability and fewer drug interactions than many antidepressants.",
    whatItDoes:
      "Treats major depression and generalized anxiety disorder. Often preferred as a first-line antidepressant due to its favorable side effect profile.",
    howItWorks:
      "Selectively inhibits serotonin reuptake with high potency and selectivity. Has an allosteric binding site on the serotonin transporter that enhances its primary inhibition, contributing to its potent and sustained effect.",
  },
  {
    name: "Fluoxetine",
    aliases: ["fluoxetine", "prozac", "sarafem"],
    synopsis:
      "The first SSRI approved in the United States (1987). Has a very long half-life, making it more forgiving of missed doses but slower to wash out.",
    whatItDoes:
      "Treats depression, OCD, bulimia nervosa, panic disorder, and premenstrual dysphoric disorder. Also approved for depression in children and adolescents.",
    howItWorks:
      "Blocks serotonin reuptake and has a uniquely long half-life (2-6 days for the parent drug; its active metabolite norfluoxetine has a 4-16 day half-life). This provides built-in tapering if doses are missed.",
  },
  {
    name: "Paroxetine",
    aliases: ["paroxetine", "paxil", "pexeva"],
    synopsis:
      "An SSRI with the most potent serotonin reuptake inhibition of the class. Also has mild anticholinergic and noradrenergic effects. Known for difficult discontinuation symptoms.",
    whatItDoes:
      "Treats depression, panic disorder, social anxiety disorder, generalized anxiety disorder, OCD, and PTSD. Its anticholinergic effects can help with anxiety-related GI symptoms.",
    howItWorks:
      "Potently inhibits serotonin reuptake and also weakly inhibits norepinephrine reuptake. Has anticholinergic activity that contributes to its anxiolytic and sedating effects. Its short half-life and lack of active metabolites make it more prone to discontinuation syndrome than other SSRIs.",
  },
  {
    name: "Citalopram",
    aliases: ["citalopram", "celexa"],
    synopsis:
      "An SSRI antidepressant that is the racemic mixture of escitalopram. Simple pharmacology with few drug interactions. Limited to 40mg daily due to dose-dependent QT prolongation.",
    whatItDoes:
      "Treats major depressive disorder. Also used off-label for anxiety disorders. Generally well-tolerated with a predictable dose-response relationship.",
    howItWorks:
      "Inhibits serotonin reuptake in the synapse. Contains both the active S-enantiomer (escitalopram) and the relatively inactive R-enantiomer. The R-enantiomer may partially counteract the S-enantiomer, which is why escitalopram is considered more effective at lower doses.",
  },
  {
    name: "Venlafaxine",
    aliases: ["venlafaxine", "effexor", "effexor xr"],
    synopsis:
      "A serotonin-norepinephrine reuptake inhibitor (SNRI) used for depression and anxiety. Its dual mechanism can be helpful when SSRIs alone are insufficient.",
    whatItDoes:
      "Treats major depression, generalized anxiety disorder, social anxiety disorder, and panic disorder. May also help with chronic pain and migraine prevention.",
    howItWorks:
      "At lower doses, primarily inhibits serotonin reuptake (similar to SSRIs). At higher doses (>150mg), also inhibits norepinephrine reuptake, providing a dual mechanism. This dose-dependent pharmacology allows clinicians to titrate the noradrenergic effect.",
  },
  {
    name: "Duloxetine",
    aliases: ["duloxetine", "cymbalta"],
    synopsis:
      "An SNRI with FDA-approved indications spanning psychiatry, pain, and urology. Unique among antidepressants for its strong evidence in chronic pain conditions.",
    whatItDoes:
      "Treats depression, generalized anxiety disorder, fibromyalgia, diabetic neuropathy, chronic musculoskeletal pain, and stress urinary incontinence.",
    howItWorks:
      "Inhibits reuptake of both serotonin and norepinephrine with relatively balanced potency. The noradrenergic component is particularly important for its pain-relieving effects, as descending noradrenergic pathways play a key role in pain modulation.",
  },
  {
    name: "Bupropion",
    aliases: ["bupropion", "wellbutrin", "zyban", "wellbutrin xl"],
    synopsis:
      "An atypical antidepressant that works through dopamine and norepinephrine rather than serotonin. Uniquely does not cause sexual side effects or weight gain.",
    whatItDoes:
      "Treats depression and seasonal affective disorder. Also FDA-approved for smoking cessation (marketed as Zyban). Often combined with SSRIs to counteract sexual side effects.",
    howItWorks:
      "Inhibits the reuptake of dopamine and norepinephrine (NDRI). Does not significantly affect serotonin. Also acts as a nicotinic acetylcholine receptor antagonist, which underlies its smoking cessation benefits.",
  },
  {
    name: "Trazodone",
    aliases: ["trazodone", "desyrel", "oleptro"],
    synopsis:
      "A serotonin modulator antidepressant that is now far more commonly prescribed at low doses as a sleep aid than as an antidepressant.",
    whatItDoes:
      "At low doses (25-100mg): promotes sleep onset and maintenance. At higher antidepressant doses (150-400mg): treats depression. Commonly used off-label for insomnia.",
    howItWorks:
      "Blocks serotonin 5-HT2A receptors and histamine H1 receptors (causing sedation), while weakly inhibiting serotonin reuptake. The sedating antihistamine and 5-HT2A blocking effects occur at lower doses than the antidepressant serotonin reuptake inhibition.",
  },
  {
    name: "Mirtazapine",
    aliases: ["mirtazapine", "remeron"],
    synopsis:
      "An atypical antidepressant known for its sedating and appetite-stimulating properties. Often chosen for depressed patients who also have insomnia and poor appetite.",
    whatItDoes:
      "Treats depression while improving sleep and appetite. Particularly useful in elderly, underweight, or insomniac patients. Paradoxically, lower doses (7.5-15mg) are more sedating than higher doses.",
    howItWorks:
      "Blocks alpha-2 adrenergic autoreceptors, increasing norepinephrine and serotonin release. Also blocks 5-HT2A, 5-HT2C, 5-HT3, and H1 histamine receptors. The antihistamine effect drives sedation and weight gain; at higher doses, noradrenergic activation counteracts some sedation.",
  },
  {
    name: "Alprazolam",
    aliases: ["alprazolam", "xanax"],
    synopsis:
      "A short-acting benzodiazepine commonly prescribed for anxiety and panic disorder. A Schedule IV controlled substance with significant potential for dependence.",
    whatItDoes:
      "Rapidly reduces anxiety, panic symptoms, and agitation. Works within 15-30 minutes but effects wear off in 4-6 hours, which can lead to interdose anxiety and rebound symptoms.",
    howItWorks:
      "Enhances the effect of gamma-aminobutyric acid (GABA) by binding to the benzodiazepine site on GABA-A receptors. This increases chloride ion flow into neurons, producing a calming effect by hyperpolarizing neural membranes.",
  },
  {
    name: "Lorazepam",
    aliases: ["lorazepam", "ativan"],
    synopsis:
      "An intermediate-acting benzodiazepine used for anxiety, insomnia, seizures, and procedural sedation. Available in oral and injectable forms.",
    whatItDoes:
      "Treats acute anxiety, panic attacks, insomnia, status epilepticus, and alcohol withdrawal. Also used for preoperative sedation and chemotherapy-induced nausea.",
    howItWorks:
      "Binds to benzodiazepine receptors on GABA-A channels, enhancing GABAergic inhibition. Unlike many benzodiazepines, it is metabolized by glucuronidation (not CYP enzymes), making it safer in liver disease and having fewer drug interactions.",
  },
  {
    name: "Diazepam",
    aliases: ["diazepam", "valium"],
    synopsis:
      "One of the original benzodiazepines with a very long half-life. Used for anxiety, muscle spasms, seizures, and alcohol withdrawal. A Schedule IV controlled substance.",
    whatItDoes:
      "Relieves anxiety, relaxes muscles, stops seizures, and manages alcohol withdrawal symptoms. Its long half-life (20-100 hours, including active metabolites) provides a self-tapering effect.",
    howItWorks:
      "Potentiates GABA at GABA-A receptors and also has direct muscle relaxant effects at the spinal cord level. Metabolized to several active metabolites (nordiazepam, temazepam, oxazepam) that extend its duration of action.",
  },
  {
    name: "Clonazepam",
    aliases: ["clonazepam", "klonopin"],
    synopsis:
      "A long-acting benzodiazepine used for seizure disorders and panic disorder. Its longer duration of action reduces interdose anxiety compared to shorter-acting benzodiazepines.",
    whatItDoes:
      "Treats panic disorder, seizure disorders (absence seizures, Lennox-Gastaut syndrome), and off-label for anxiety, insomnia, and restless legs syndrome.",
    howItWorks:
      "Enhances GABA-A receptor function, increasing inhibitory neurotransmission. Also has serotonergic effects that may contribute to its anti-panic efficacy. Its long half-life (18-50 hours) provides stable blood levels throughout the day.",
  },
  {
    name: "Buspirone",
    aliases: ["buspirone", "buspar"],
    synopsis:
      "A non-benzodiazepine anxiolytic with no potential for dependence or abuse. Takes 2-4 weeks to work, unlike the immediate relief of benzodiazepines.",
    whatItDoes:
      "Treats generalized anxiety disorder (GAD) without causing sedation, cognitive impairment, or physical dependence. Does not interact with alcohol. A good long-term anxiety treatment.",
    howItWorks:
      "Acts as a partial agonist at serotonin 5-HT1A receptors. This modulates serotonin signaling in a way that reduces anxiety over time. Unlike benzodiazepines, it does not enhance GABA activity, which is why it lacks sedation and abuse potential.",
  },
  {
    name: "Hydroxyzine",
    aliases: ["hydroxyzine", "vistaril", "atarax"],
    synopsis:
      "A first-generation antihistamine with anxiolytic properties. Often used as a non-addictive alternative to benzodiazepines for situational anxiety and as a pre-procedural sedative.",
    whatItDoes:
      "Reduces anxiety, treats itching and hives, and provides sedation before medical procedures. No risk of dependence or abuse, making it useful when benzodiazepines are contraindicated.",
    howItWorks:
      "Blocks histamine H1 receptors (causing sedation and anti-itch effects) and has anticholinergic properties. Its anxiolytic effect is believed to stem from suppression of activity in certain subcortical brain regions through histamine receptor blockade.",
  },
  {
    name: "Lithium",
    aliases: ["lithium", "lithobid", "eskalith", "lithium carbonate"],
    synopsis:
      "The gold standard mood stabilizer for bipolar disorder, used for over 70 years. One of the few psychiatric medications shown to reduce suicide risk. Requires regular blood level monitoring.",
    whatItDoes:
      "Stabilizes mood in bipolar disorder, treating and preventing both manic and depressive episodes. Reduces suicide risk. Also used to augment antidepressants in treatment-resistant depression.",
    howItWorks:
      "The exact mechanism remains incompletely understood. It modulates multiple signaling pathways: inhibits inositol monophosphatase (affecting the phosphoinositide cycle), inhibits glycogen synthase kinase-3 (GSK-3), and influences neurotransmitter release and neuroprotective pathways.",
  },
  {
    name: "Lamotrigine",
    aliases: ["lamotrigine", "lamictal"],
    synopsis:
      "An anticonvulsant widely used as a mood stabilizer in bipolar disorder. Particularly effective for preventing bipolar depressive episodes. Requires slow dose titration to avoid a rare but serious skin reaction.",
    whatItDoes:
      "Prevents mood episodes in bipolar disorder — especially depression. Also treats epilepsy (partial seizures and generalized seizures). One of the few mood stabilizers effective for bipolar depression prevention.",
    howItWorks:
      "Blocks voltage-gated sodium channels, stabilizing neuronal membranes and reducing excitatory glutamate release. Also modulates calcium channels. Must be titrated slowly due to the risk of Stevens-Johnson syndrome, a life-threatening skin reaction.",
  },
  {
    name: "Quetiapine",
    aliases: ["quetiapine", "seroquel", "seroquel xr"],
    synopsis:
      "An atypical antipsychotic with a broad range of uses spanning psychosis, bipolar disorder, depression augmentation, and insomnia.",
    whatItDoes:
      "At low doses (25-100mg): aids sleep. At moderate doses (150-300mg): treats depression and anxiety (as adjunct). At higher doses (400-800mg): treats schizophrenia and bipolar mania.",
    howItWorks:
      "Blocks dopamine D2 receptors (antipsychotic effect), serotonin 5-HT2A receptors (improves mood and reduces extrapyramidal side effects), histamine H1 receptors (sedation), and adrenergic alpha-1 receptors (orthostatic hypotension). Its active metabolite norquetiapine inhibits norepinephrine reuptake.",
  },
  {
    name: "Aripiprazole",
    aliases: ["aripiprazole", "abilify"],
    synopsis:
      "An atypical antipsychotic with a unique mechanism as a partial dopamine agonist. Less likely to cause weight gain and metabolic side effects than other antipsychotics.",
    whatItDoes:
      "Treats schizophrenia, bipolar disorder, depression (as augmentation), irritability in autism, and Tourette syndrome. Also available as a long-acting injectable.",
    howItWorks:
      "Acts as a partial agonist at dopamine D2 and serotonin 5-HT1A receptors, and as an antagonist at 5-HT2A receptors. As a partial D2 agonist, it stabilizes dopamine activity — reducing it where it is excessive (psychosis) and enhancing it where it is deficient (negative symptoms).",
  },
  {
    name: "Olanzapine",
    aliases: ["olanzapine", "zyprexa"],
    synopsis:
      "An atypical antipsychotic known for strong efficacy in schizophrenia and bipolar mania but also for significant metabolic side effects (weight gain, diabetes risk).",
    whatItDoes:
      "Treats schizophrenia, bipolar mania, and treatment-resistant depression (combined with fluoxetine). Highly effective but requires metabolic monitoring.",
    howItWorks:
      "Blocks multiple receptors including dopamine D1-D4, serotonin 5-HT2A/2C, histamine H1, muscarinic M1-M5, and adrenergic alpha-1 receptors. The broad receptor profile contributes to both its efficacy and side effects, particularly 5-HT2C and H1 blockade driving weight gain.",
  },
  {
    name: "Risperidone",
    aliases: ["risperidone", "risperdal"],
    synopsis:
      "An atypical antipsychotic commonly used in schizophrenia, bipolar disorder, and irritability in autism. Available as oral tablets and a long-acting injectable.",
    whatItDoes:
      "Treats schizophrenia, bipolar mania, and irritability associated with autism in children. The long-acting injectable provides 2-week coverage for adherence-challenged patients.",
    howItWorks:
      "Potently blocks dopamine D2 and serotonin 5-HT2A receptors. The 5-HT2A/D2 ratio is high, which reduces extrapyramidal side effects at lower doses. However, it strongly elevates prolactin due to its D2 blockade in the tuberoinfundibular pathway.",
  },

  // ── Respiratory ──
  {
    name: "Albuterol",
    aliases: ["albuterol", "proventil", "ventolin", "proair", "salbutamol"],
    synopsis:
      "The most commonly used rescue inhaler for asthma and COPD. Provides rapid bronchodilation within minutes of inhalation.",
    whatItDoes:
      "Quickly relieves acute bronchospasm, wheezing, and shortness of breath. Used as a rescue medication for asthma attacks and before exercise to prevent exercise-induced bronchospasm.",
    howItWorks:
      "Selectively stimulates beta-2 adrenergic receptors in bronchial smooth muscle. This activates adenylyl cyclase, increases cyclic AMP, and relaxes the smooth muscle, opening the airways within 5-15 minutes. Effects last 4-6 hours.",
  },
  {
    name: "Fluticasone",
    aliases: ["fluticasone", "flovent", "flonase", "arnuity", "fluticasone propionate", "fluticasone furoate"],
    synopsis:
      "An inhaled corticosteroid available for both asthma (inhaler) and allergic rhinitis (nasal spray). The most prescribed inhaled steroid.",
    whatItDoes:
      "Prevents asthma attacks and controls chronic asthma symptoms when used daily. As a nasal spray, relieves nasal congestion, sneezing, and runny nose from allergies.",
    howItWorks:
      "Binds to glucocorticoid receptors inside cells, modifying gene transcription to suppress inflammatory mediators (cytokines, prostaglandins, leukotrienes) and reduce airway inflammation, swelling, and mucus production. Takes days to weeks for full benefit — not a rescue medication.",
  },
  {
    name: "Budesonide",
    aliases: ["budesonide", "pulmicort", "rhinocort", "entocort"],
    synopsis:
      "An inhaled corticosteroid used for asthma and allergic rhinitis. Also available as an oral formulation for inflammatory bowel disease due to its high first-pass metabolism in the liver.",
    whatItDoes:
      "Controls asthma when inhaled, treats nasal allergies as a spray, and treats Crohn's disease and ulcerative colitis as an oral formulation with targeted gut activity.",
    howItWorks:
      "Activates glucocorticoid receptors to suppress airway inflammation. When taken orally for IBD, it is released in the ileum and colon, acting locally before ~90% is inactivated during first-pass liver metabolism, reducing systemic steroid side effects.",
  },
  {
    name: "Montelukast",
    aliases: ["montelukast", "singulair"],
    synopsis:
      "A leukotriene receptor antagonist used for asthma and allergic rhinitis. Taken orally once daily, usually at bedtime. FDA has added a boxed warning regarding neuropsychiatric side effects.",
    whatItDoes:
      "Prevents asthma symptoms and exercise-induced bronchospasm. Also treats seasonal and perennial allergic rhinitis. Less effective than inhaled steroids for asthma control.",
    howItWorks:
      "Blocks cysteinyl leukotriene receptor type 1 (CysLT1). Leukotrienes are inflammatory chemicals released during allergic reactions that constrict airways, increase mucus, and promote swelling. Blocking their receptor prevents these effects.",
  },
  {
    name: "Tiotropium",
    aliases: ["tiotropium", "spiriva"],
    synopsis:
      "A long-acting anticholinergic bronchodilator used primarily for COPD. Provides 24-hour bronchodilation from a single daily inhalation.",
    whatItDoes:
      "Maintains open airways in COPD patients, reducing exacerbations and improving breathing and quality of life. Also approved as add-on therapy for asthma.",
    howItWorks:
      "Blocks muscarinic M3 receptors in airway smooth muscle, preventing acetylcholine from causing bronchoconstriction. Has very slow dissociation from the receptor, which accounts for its long 24-hour duration of action.",
  },
  {
    name: "Benzonatate",
    aliases: ["benzonatate", "tessalon", "tessalon perles"],
    synopsis:
      "A non-narcotic cough suppressant that numbs the stretch receptors in the lungs. Available as gelatin capsules that must be swallowed whole.",
    whatItDoes:
      "Suppresses cough by reducing the cough reflex. Does not treat the underlying cause of cough but provides symptomatic relief. No sedating or addictive effects.",
    howItWorks:
      "Chemically related to local anesthetics (tetracaine). Anesthetizes the stretch receptors in the lungs and airways, reducing their sensitivity to irritation and suppressing the cough reflex at its source.",
  },

  // ── Gastrointestinal ──
  {
    name: "Omeprazole",
    aliases: ["omeprazole", "prilosec"],
    synopsis:
      "The first proton pump inhibitor (PPI) and still one of the most widely used acid-suppressing medications. Available over-the-counter and by prescription.",
    whatItDoes:
      "Dramatically reduces stomach acid production. Treats GERD (acid reflux), stomach and duodenal ulcers, erosive esophagitis, and Zollinger-Ellison syndrome. Helps heal damage from stomach acid.",
    howItWorks:
      "Irreversibly inhibits the hydrogen-potassium ATPase enzyme (proton pump) on gastric parietal cells — the final step of acid production. Because it irreversibly binds, acid suppression lasts until new pumps are synthesized (about 24-48 hours).",
  },
  {
    name: "Pantoprazole",
    aliases: ["pantoprazole", "protonix"],
    synopsis:
      "A proton pump inhibitor often preferred in hospital settings due to its availability in IV form. Has fewer drug interactions than omeprazole.",
    whatItDoes:
      "Reduces stomach acid for GERD, erosive esophagitis, and ulcer healing. The IV form is used for acute upper GI bleeding and when patients cannot take oral medications.",
    howItWorks:
      "Irreversibly blocks the gastric H+/K+ ATPase proton pump. Compared to omeprazole, pantoprazole has less inhibition of CYP2C19, resulting in fewer interactions with medications like clopidogrel.",
  },
  {
    name: "Esomeprazole",
    aliases: ["esomeprazole", "nexium"],
    synopsis:
      "The S-isomer of omeprazole, marketed as a more effective PPI. One of the best-selling medications in history. Available OTC and by prescription.",
    whatItDoes:
      "Treats GERD, erosive esophagitis, and H. pylori infection (with antibiotics). Heals acid-related damage to the esophagus and prevents recurrence.",
    howItWorks:
      "As the active S-isomer of omeprazole, it irreversibly inhibits the gastric proton pump with slightly more consistent bioavailability. It undergoes less variable first-pass metabolism compared to racemic omeprazole.",
  },
  {
    name: "Famotidine",
    aliases: ["famotidine", "pepcid"],
    synopsis:
      "An H2 receptor blocker that reduces stomach acid. Less potent than PPIs but has a faster onset and fewer long-term concerns. Available over-the-counter.",
    whatItDoes:
      "Treats and prevents heartburn, acid indigestion, GERD, and peptic ulcers. Works within 1-3 hours and lasts 10-12 hours. Often used for occasional acid reflux.",
    howItWorks:
      "Competitively blocks histamine H2 receptors on gastric parietal cells. Histamine is one of three signals (along with acetylcholine and gastrin) that stimulate acid secretion. Blocking it reduces both basal and meal-stimulated acid production.",
  },
  {
    name: "Ondansetron",
    aliases: ["ondansetron", "zofran"],
    synopsis:
      "A highly effective anti-nausea medication originally developed for chemotherapy-induced nausea. Now widely used for nausea and vomiting from many causes.",
    whatItDoes:
      "Prevents and treats nausea and vomiting caused by chemotherapy, radiation, surgery, and gastroenteritis. Available as tablets, oral dissolving tablets, and injection.",
    howItWorks:
      "Blocks serotonin 5-HT3 receptors both in the gut (where chemotherapy triggers serotonin release from enterochromaffin cells) and in the chemoreceptor trigger zone of the brain. This dual blockade prevents the vomiting reflex from being activated.",
  },
  {
    name: "Loperamide",
    aliases: ["loperamide", "imodium"],
    synopsis:
      "An over-the-counter anti-diarrheal medication. Acts on opioid receptors in the gut but does not cross the blood-brain barrier at normal doses, so it has no CNS effects.",
    whatItDoes:
      "Slows intestinal motility and reduces the frequency and volume of diarrheal stools. Used for acute and chronic diarrhea, including traveler's diarrhea.",
    howItWorks:
      "Activates mu-opioid receptors in the myenteric plexus of the intestinal wall, slowing peristalsis and increasing transit time. Also increases anal sphincter tone and reduces fluid and electrolyte secretion into the intestinal lumen.",
  },

  // ── Antibiotics ──
  {
    name: "Amoxicillin",
    aliases: ["amoxicillin", "amoxil"],
    synopsis:
      "One of the most commonly prescribed antibiotics worldwide. A broad-spectrum penicillin-type antibiotic with excellent oral absorption.",
    whatItDoes:
      "Treats a wide range of bacterial infections including ear infections, sinus infections, strep throat, urinary tract infections, skin infections, and dental infections.",
    howItWorks:
      "Binds to penicillin-binding proteins (PBPs) and inhibits bacterial cell wall synthesis by preventing cross-linking of peptidoglycan chains. Bacteria cannot maintain cell wall integrity and undergo lysis (bursting). Ineffective against bacteria that produce beta-lactamase enzymes.",
  },
  {
    name: "Amoxicillin-Clavulanate",
    aliases: ["amoxicillin-clavulanate", "augmentin", "amox-clav"],
    synopsis:
      "Amoxicillin combined with clavulanate, a beta-lactamase inhibitor. This combination extends amoxicillin's spectrum to cover resistant bacteria.",
    whatItDoes:
      "Treats infections caused by beta-lactamase-producing bacteria, including sinusitis, otitis media, lower respiratory infections, UTIs, and skin infections that amoxicillin alone cannot handle.",
    howItWorks:
      "Clavulanate irreversibly binds to and inactivates beta-lactamase enzymes produced by resistant bacteria, protecting amoxicillin from degradation. This allows amoxicillin to reach its target (penicillin-binding proteins) and kill bacteria that would otherwise be resistant.",
  },
  {
    name: "Azithromycin",
    aliases: ["azithromycin", "zithromax", "z-pack", "zpack"],
    synopsis:
      "A macrolide antibiotic famous for its convenient short-course dosing (the 'Z-Pack'). Concentrates in tissues at levels far higher than blood levels.",
    whatItDoes:
      "Treats respiratory infections, skin infections, ear infections, sexually transmitted infections (chlamydia), and traveler's diarrhea. The 5-day Z-Pack is one of the most prescribed antibiotic courses.",
    howItWorks:
      "Binds to the 50S ribosomal subunit of bacteria, blocking protein synthesis by inhibiting translocation. Its unique pharmacokinetics — accumulation in white blood cells that deliver it to infection sites — allows short treatment courses despite a long tissue half-life (68 hours).",
  },
  {
    name: "Ciprofloxacin",
    aliases: ["ciprofloxacin", "cipro"],
    synopsis:
      "A fluoroquinolone antibiotic with broad-spectrum coverage. Very effective but reserved for serious infections due to potential for significant side effects including tendon damage.",
    whatItDoes:
      "Treats urinary tract infections, prostate infections, respiratory infections, bone and joint infections, gastrointestinal infections, and anthrax exposure.",
    howItWorks:
      "Inhibits bacterial DNA gyrase and topoisomerase IV — enzymes essential for DNA replication, transcription, and repair. This is bactericidal: the trapped enzyme-DNA complexes create lethal double-strand breaks in bacterial chromosomes.",
  },
  {
    name: "Levofloxacin",
    aliases: ["levofloxacin", "levaquin"],
    synopsis:
      "A fluoroquinolone antibiotic (the 'respiratory fluoroquinolone') with broader gram-positive coverage than ciprofloxacin. Reserved for serious infections.",
    whatItDoes:
      "Treats community-acquired pneumonia, sinusitis, urinary tract infections, and skin infections. Better streptococcal coverage than ciprofloxacin makes it useful for respiratory infections.",
    howItWorks:
      "Inhibits bacterial DNA gyrase and topoisomerase IV, preventing DNA replication. As the L-isomer of ofloxacin, it has approximately twice the potency. Carries the same FDA boxed warnings as other fluoroquinolones for tendon, nerve, and CNS effects.",
  },
  {
    name: "Doxycycline",
    aliases: ["doxycycline", "vibramycin", "doryx", "monodox"],
    synopsis:
      "A versatile tetracycline antibiotic with a wide range of uses beyond infections, including acne, rosacea, and malaria prevention. Well-absorbed and taken once or twice daily.",
    whatItDoes:
      "Treats respiratory infections, Lyme disease, acne, rosacea, chlamydia, urinary infections, malaria prophylaxis, and rickettsial infections. Also has anti-inflammatory properties.",
    howItWorks:
      "Binds to the 30S ribosomal subunit of bacteria, preventing aminoacyl-tRNA from attaching to the ribosome's acceptor site. This blocks protein synthesis. Its anti-inflammatory effects (useful in acne/rosacea) involve inhibiting matrix metalloproteinases and reducing cytokine production.",
  },
  {
    name: "Cephalexin",
    aliases: ["cephalexin", "keflex"],
    synopsis:
      "A first-generation cephalosporin antibiotic commonly prescribed for skin and soft tissue infections. Well-tolerated and safe in most penicillin-allergic patients.",
    whatItDoes:
      "Treats skin infections (cellulitis, impetigo), strep throat, urinary tract infections, bone infections, and ear infections. Often chosen for staph and strep skin infections.",
    howItWorks:
      "Like penicillins, it inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins. First-generation cephalosporins have good gram-positive coverage (staph, strep) but limited gram-negative coverage. Cross-allergy with penicillin is about 1-2%.",
  },
  {
    name: "Trimethoprim-Sulfamethoxazole",
    aliases: ["trimethoprim-sulfamethoxazole", "bactrim", "septra", "tmp-smx", "co-trimoxazole"],
    synopsis:
      "A combination antibiotic pairing two drugs that block sequential steps in bacterial folate synthesis. Synergistic and bactericidal together.",
    whatItDoes:
      "Treats urinary tract infections, MRSA skin infections, traveler's diarrhea, and Pneumocystis pneumonia (PCP) prevention in immunocompromised patients.",
    howItWorks:
      "Sulfamethoxazole inhibits dihydropteroate synthase (early in folate synthesis), while trimethoprim inhibits dihydrofolate reductase (later in the pathway). By blocking two sequential steps, the combination is synergistic and bactericidal, even though each drug alone is only bacteriostatic.",
  },
  {
    name: "Metronidazole",
    aliases: ["metronidazole", "flagyl"],
    synopsis:
      "An antibiotic and antiprotozoal medication effective against anaerobic bacteria and certain parasites. One of the few antibiotics that must not be combined with alcohol.",
    whatItDoes:
      "Treats C. difficile colitis, bacterial vaginosis, H. pylori infection (as part of triple therapy), intra-abdominal infections, and parasitic infections (Giardia, amoebiasis).",
    howItWorks:
      "Enters anaerobic cells where it is reduced to reactive intermediates that damage DNA, causing strand breakage and cell death. Only works in low-oxygen environments, which is why it is selective for anaerobic organisms.",
  },
  {
    name: "Clindamycin",
    aliases: ["clindamycin", "cleocin"],
    synopsis:
      "A lincosamide antibiotic with excellent coverage of gram-positive and anaerobic bacteria. Available in oral, IV, and topical forms.",
    whatItDoes:
      "Treats skin and soft tissue infections, bone infections, dental infections, and pelvic infections. Topical form is widely used for acne. Good alternative for penicillin-allergic patients.",
    howItWorks:
      "Binds to the 50S ribosomal subunit, inhibiting bacterial protein synthesis by blocking peptide bond formation. Also suppresses bacterial toxin production, which is valuable in toxin-mediated infections like streptococcal toxic shock syndrome.",
  },
  {
    name: "Nitrofurantoin",
    aliases: ["nitrofurantoin", "macrobid", "macrodantin"],
    synopsis:
      "An antibiotic used almost exclusively for urinary tract infections. It concentrates in the urine and does not achieve therapeutic levels elsewhere in the body.",
    whatItDoes:
      "Treats and prevents uncomplicated lower urinary tract infections (bladder infections). Effective against most common UTI pathogens including many resistant organisms.",
    howItWorks:
      "Bacterial enzymes reduce nitrofurantoin to reactive intermediates that damage DNA, RNA, proteins, and cell wall synthesis through multiple mechanisms. This multi-target approach explains why bacterial resistance develops slowly compared to other antibiotics.",
  },

  // ── Antifungals ──
  {
    name: "Fluconazole",
    aliases: ["fluconazole", "diflucan"],
    synopsis:
      "A systemic antifungal medication commonly prescribed for yeast infections. Available in single-dose treatment for vaginal candidiasis.",
    whatItDoes:
      "Treats vaginal yeast infections, oral thrush, esophageal candidiasis, and systemic fungal infections. Often a single 150mg dose for vaginal candidiasis.",
    howItWorks:
      "Inhibits fungal cytochrome P450 enzyme lanosterol 14-alpha-demethylase, which is essential for converting lanosterol to ergosterol — a critical component of fungal cell membranes. Without ergosterol, the membrane becomes permeable and the fungal cell dies.",
  },

  // ── Antivirals ──
  {
    name: "Acyclovir",
    aliases: ["acyclovir", "zovirax", "valacyclovir", "valtrex"],
    synopsis:
      "An antiviral medication active against herpes simplex viruses (HSV-1, HSV-2) and varicella-zoster virus (VZV). Valacyclovir is its better-absorbed prodrug.",
    whatItDoes:
      "Treats and suppresses genital herpes, cold sores, shingles, and chickenpox. Chronic suppressive therapy reduces transmission and outbreak frequency.",
    howItWorks:
      "A nucleoside analog that is selectively activated by viral thymidine kinase (only present in infected cells). Once activated, it is incorporated into viral DNA by DNA polymerase, causing chain termination and stopping viral replication.",
  },
  {
    name: "Oseltamivir",
    aliases: ["oseltamivir", "tamiflu"],
    synopsis:
      "An antiviral medication for influenza A and B. Most effective when started within 48 hours of symptom onset. Available as capsules and oral suspension.",
    whatItDoes:
      "Reduces the duration and severity of flu symptoms by about 1-2 days. Can also prevent influenza in exposed individuals. Used in both seasonal and pandemic flu.",
    howItWorks:
      "Inhibits the neuraminidase enzyme on the surface of influenza viruses. Neuraminidase is needed for the release of newly formed viral particles from infected cells. Blocking it traps new viruses on the cell surface, preventing spread to other cells.",
  },

  // ── Thyroid ──
  {
    name: "Levothyroxine",
    aliases: ["levothyroxine", "synthroid", "levoxyl", "tirosint", "unithroid", "t4"],
    synopsis:
      "A synthetic form of the thyroid hormone T4, and one of the most prescribed medications in the world. The standard treatment for hypothyroidism.",
    whatItDoes:
      "Replaces deficient thyroid hormone, normalizing metabolism, energy levels, weight, temperature regulation, and many other body functions affected by hypothyroidism.",
    howItWorks:
      "Provides synthetic T4 (thyroxine), which is converted in the body to T3 (triiodothyronine), the active thyroid hormone. T3 binds to nuclear thyroid receptors in cells throughout the body, regulating gene expression that controls metabolic rate, protein synthesis, and development.",
  },
  {
    name: "Methimazole",
    aliases: ["methimazole", "tapazole"],
    synopsis:
      "An anti-thyroid medication used to treat hyperthyroidism (overactive thyroid). The preferred anti-thyroid drug in most countries.",
    whatItDoes:
      "Reduces thyroid hormone production in Graves' disease and other forms of hyperthyroidism. Can achieve remission in some patients with Graves' disease after 12-18 months of therapy.",
    howItWorks:
      "Inhibits thyroid peroxidase, the enzyme that iodinates tyrosine residues on thyroglobulin and couples iodotyrosines — both essential steps in thyroid hormone synthesis. This blocks the production of T3 and T4 without affecting already-stored hormone.",
  },

  // ── Bone Health ──
  {
    name: "Alendronate",
    aliases: ["alendronate", "fosamax"],
    synopsis:
      "A bisphosphonate used to treat and prevent osteoporosis. Must be taken on an empty stomach while remaining upright for 30 minutes to prevent esophageal irritation.",
    whatItDoes:
      "Strengthens bones and reduces the risk of fractures in osteoporosis. Increases bone mineral density at the spine and hip. Typically taken once weekly.",
    howItWorks:
      "Binds to hydroxyapatite in bone and is taken up by osteoclasts (bone-resorbing cells) during bone remodeling. Inside the osteoclast, it inhibits farnesyl pyrophosphate synthase, disrupting the mevalonate pathway and causing osteoclast apoptosis, thereby reducing bone resorption.",
  },

  // ── Allergy & Antihistamines ──
  {
    name: "Cetirizine",
    aliases: ["cetirizine", "zyrtec"],
    synopsis:
      "A second-generation antihistamine available over-the-counter. Less sedating than first-generation antihistamines like diphenhydramine but may still cause drowsiness in some people.",
    whatItDoes:
      "Relieves sneezing, runny nose, itchy/watery eyes, and hives from allergies. Works within 1 hour and lasts 24 hours. Effective for both seasonal and perennial allergic rhinitis.",
    howItWorks:
      "Selectively blocks peripheral histamine H1 receptors, preventing histamine (released by mast cells during allergic reactions) from causing its typical effects: vasodilation, increased vascular permeability, itching, and smooth muscle contraction.",
  },
  {
    name: "Loratadine",
    aliases: ["loratadine", "claritin"],
    synopsis:
      "A second-generation, non-sedating antihistamine available over-the-counter. One of the least sedating antihistamines available.",
    whatItDoes:
      "Treats allergic rhinitis symptoms (sneezing, runny nose, itchy eyes) and chronic hives. Minimal to no drowsiness at recommended doses.",
    howItWorks:
      "Blocks peripheral H1 histamine receptors with high selectivity. Does not significantly cross the blood-brain barrier at standard doses, which is why it rarely causes sedation. Metabolized to desloratadine, which is also an active antihistamine.",
  },
  {
    name: "Fexofenadine",
    aliases: ["fexofenadine", "allegra"],
    synopsis:
      "A second-generation antihistamine that is the active metabolite of terfenadine. Considered the least sedating of the second-generation antihistamines.",
    whatItDoes:
      "Treats seasonal allergic rhinitis and chronic hives. Does not cause drowsiness at recommended doses and does not impair driving or cognitive performance.",
    howItWorks:
      "Selectively blocks peripheral H1 receptors without crossing the blood-brain barrier. Unlike its parent compound terfenadine, it does not block cardiac potassium channels, eliminating the cardiac arrhythmia risk that led to terfenadine's withdrawal from the market.",
  },
  {
    name: "Diphenhydramine",
    aliases: ["diphenhydramine", "benadryl"],
    synopsis:
      "A first-generation antihistamine known for its strong sedating effects. Used for allergies, itching, motion sickness, and as an over-the-counter sleep aid.",
    whatItDoes:
      "Treats allergic reactions, hives, itching, and cold symptoms. Also used as a sleep aid and for motion sickness. Causes significant drowsiness.",
    howItWorks:
      "Blocks H1 histamine receptors both peripherally (reducing allergy symptoms) and centrally (causing sedation). Also blocks muscarinic acetylcholine receptors (anticholinergic effects: dry mouth, urinary retention) and crosses the blood-brain barrier readily.",
  },

  // ── Corticosteroids ──
  {
    name: "Prednisone",
    aliases: ["prednisone", "deltasone", "rayos"],
    synopsis:
      "A systemic corticosteroid used as a powerful anti-inflammatory and immunosuppressant. Extremely versatile but carries significant side effects with long-term use.",
    whatItDoes:
      "Treats a wide array of inflammatory and autoimmune conditions: asthma exacerbations, COPD flares, lupus, rheumatoid arthritis, inflammatory bowel disease, allergic reactions, and many more.",
    howItWorks:
      "A prodrug converted in the liver to prednisolone. Binds to glucocorticoid receptors, translocates to the nucleus, and modifies gene transcription — suppressing inflammatory cytokines, prostaglandins, and leukotrienes while reducing immune cell activity.",
  },
  {
    name: "Methylprednisolone",
    aliases: ["methylprednisolone", "medrol", "solu-medrol", "depo-medrol"],
    synopsis:
      "A corticosteroid available in oral and injectable forms. The IV form (Solu-Medrol) is frequently used in emergency and hospital settings for acute inflammatory crises.",
    whatItDoes:
      "Treats severe allergic reactions, asthma exacerbations, multiple sclerosis relapses, and organ transplant rejection. The dose pack (Medrol Dosepak) is commonly prescribed for acute conditions.",
    howItWorks:
      "Directly binds glucocorticoid receptors (does not require liver conversion like prednisone). Modifies transcription of anti-inflammatory and immunosuppressive genes. Has slightly more anti-inflammatory potency than prednisone with less mineralocorticoid activity.",
  },
  {
    name: "Dexamethasone",
    aliases: ["dexamethasone", "decadron"],
    synopsis:
      "The most potent commonly used corticosteroid, approximately 6 times stronger than prednisone. Has a long duration of action and minimal mineralocorticoid (salt-retaining) effects.",
    whatItDoes:
      "Treats severe inflammation, cerebral edema, chemotherapy-induced nausea, and croup in children. Gained prominence during COVID-19 as it reduced mortality in severe cases requiring oxygen.",
    howItWorks:
      "Potently activates glucocorticoid receptors with high affinity, suppressing inflammatory gene expression. Its long half-life (36-72 hours) allows less frequent dosing. Minimal aldosterone-like effects mean less fluid retention compared to other steroids.",
  },

  // ── Seizures / Epilepsy ──
  {
    name: "Levetiracetam",
    aliases: ["levetiracetam", "keppra"],
    synopsis:
      "A modern anticonvulsant with a unique mechanism of action and few drug interactions. One of the most commonly prescribed epilepsy medications.",
    whatItDoes:
      "Prevents partial-onset, myoclonic, and generalized tonic-clonic seizures. Can be used as initial therapy or add-on treatment. Available in IV form for hospitalized patients.",
    howItWorks:
      "Binds to synaptic vesicle protein 2A (SV2A), a protein involved in neurotransmitter vesicle fusion and release. This modulates neurotransmitter release in a way that reduces seizure activity. Unlike older anticonvulsants, it has minimal effects on sodium or calcium channels.",
  },
  {
    name: "Valproic Acid",
    aliases: ["valproic acid", "valproate", "depakote", "depakene", "divalproex"],
    synopsis:
      "A broad-spectrum anticonvulsant and mood stabilizer effective against many seizure types. Also used for bipolar disorder and migraine prevention.",
    whatItDoes:
      "Treats generalized and partial seizures, bipolar mania, and prevents migraines. One of the few anticonvulsants effective across many seizure types.",
    howItWorks:
      "Has multiple mechanisms: blocks voltage-gated sodium channels, enhances GABA levels (by inhibiting GABA degradation and increasing GABA synthesis), and blocks T-type calcium channels. This multi-target approach may explain its broad-spectrum efficacy.",
  },
  {
    name: "Phenytoin",
    aliases: ["phenytoin", "dilantin"],
    synopsis:
      "One of the oldest anticonvulsants still in use. Has complex pharmacokinetics with a narrow therapeutic window requiring blood level monitoring.",
    whatItDoes:
      "Treats and prevents tonic-clonic and partial seizures. Also used IV for status epilepticus. Does not work for absence seizures (may worsen them).",
    howItWorks:
      "Blocks voltage-gated sodium channels in a use-dependent manner — preferentially stabilizing neurons that are firing rapidly (as in a seizure) without significantly affecting normal neuronal firing. Has zero-order (saturation) kinetics at therapeutic doses, making dose adjustments tricky.",
  },
  {
    name: "Carbamazepine",
    aliases: ["carbamazepine", "tegretol"],
    synopsis:
      "An anticonvulsant also used for trigeminal neuralgia (severe facial pain) and bipolar disorder. One of the most important medications for focal seizures.",
    whatItDoes:
      "Treats partial (focal) seizures, generalized tonic-clonic seizures, trigeminal neuralgia, and bipolar disorder. The first-line treatment for trigeminal neuralgia.",
    howItWorks:
      "Blocks voltage-gated sodium channels, reducing repetitive neuronal firing. Also has minor effects on GABA and glutamate pathways. Induces its own metabolism (autoinduction) over the first few weeks, requiring dose adjustments.",
  },

  // ── Migraine ──
  {
    name: "Sumatriptan",
    aliases: ["sumatriptan", "imitrex"],
    synopsis:
      "The first triptan developed for acute migraine treatment. Available as tablets, nasal spray, and injection. The injection form works fastest (within 10 minutes).",
    whatItDoes:
      "Stops migraine headaches in progress, relieving pain, nausea, and sensitivity to light and sound. Most effective when taken early in a migraine attack.",
    howItWorks:
      "Activates serotonin 5-HT1B and 5-HT1D receptors. 5-HT1B activation constricts dilated cranial blood vessels, while 5-HT1D activation inhibits the release of inflammatory neuropeptides (like CGRP) from trigeminal nerve endings.",
  },
  {
    name: "Topiramate",
    aliases: ["topiramate", "topamax", "qudexy", "trokendi"],
    synopsis:
      "An anticonvulsant widely used for migraine prevention and sometimes for weight loss. Known for cognitive side effects sometimes called 'dopamax' by patients.",
    whatItDoes:
      "Prevents migraines (reduces frequency by ~50%), treats epilepsy, and is a component of a weight loss medication (Qsymia). Side effects include tingling, word-finding difficulty, and kidney stones.",
    howItWorks:
      "Works through multiple mechanisms: blocks voltage-gated sodium channels, enhances GABA activity at GABA-A receptors, antagonizes glutamate at AMPA/kainate receptors, and inhibits carbonic anhydrase.",
  },

  // ── Muscle Relaxants ──
  {
    name: "Cyclobenzaprine",
    aliases: ["cyclobenzaprine", "flexeril", "amrix"],
    synopsis:
      "A centrally-acting muscle relaxant structurally related to tricyclic antidepressants. Used for short-term relief of muscle spasms associated with acute musculoskeletal conditions.",
    whatItDoes:
      "Relieves muscle spasms and associated pain from acute musculoskeletal injuries (strains, sprains). Most effective in the first 1-2 weeks. Causes significant drowsiness.",
    howItWorks:
      "Acts in the brainstem to reduce tonic motor neuron activity, decreasing muscle hyperactivity without affecting muscle function directly. Its tricyclic structure also blocks serotonin and histamine receptors, contributing to sedation.",
  },
  {
    name: "Baclofen",
    aliases: ["baclofen", "lioresal", "gablofen"],
    synopsis:
      "A GABA-B receptor agonist used as a muscle relaxant. Particularly effective for spasticity from spinal cord injuries, multiple sclerosis, and cerebral palsy.",
    whatItDoes:
      "Reduces spasticity (involuntary muscle stiffness and spasms) in neurological conditions. Available orally and as an intrathecal pump for severe spasticity.",
    howItWorks:
      "Activates GABA-B receptors in the spinal cord, which are inhibitory G-protein coupled receptors. This reduces excitatory neurotransmitter release at the spinal level, decreasing muscle tone and spasm frequency.",
  },
  {
    name: "Tizanidine",
    aliases: ["tizanidine", "zanaflex"],
    synopsis:
      "A centrally-acting alpha-2 adrenergic agonist used as a muscle relaxant. Short-acting with less muscle weakness than baclofen at equivalent doses.",
    whatItDoes:
      "Treats muscle spasticity from multiple sclerosis, spinal cord injury, and other neurological conditions. Also used off-label for tension headaches and myofascial pain.",
    howItWorks:
      "Stimulates alpha-2 adrenergic receptors in the spinal cord, reducing the release of excitatory amino acids from spinal interneurons. This reduces polysynaptic reflex activity, decreasing muscle tone. Similar mechanism to clonidine but with more muscle relaxant and less blood pressure-lowering effect.",
  },

  // ── Erectile Dysfunction ──
  {
    name: "Sildenafil",
    aliases: ["sildenafil", "viagra", "revatio"],
    synopsis:
      "A PDE5 inhibitor originally developed for angina that became the first oral treatment for erectile dysfunction. Also approved for pulmonary arterial hypertension (as Revatio).",
    whatItDoes:
      "Treats erectile dysfunction by enabling erections in response to sexual stimulation. As Revatio, lowers pulmonary artery pressure. Effects last 4-6 hours.",
    howItWorks:
      "Inhibits phosphodiesterase type 5 (PDE5), the enzyme that breaks down cyclic GMP in the corpus cavernosum. During sexual stimulation, nitric oxide increases cGMP, which relaxes smooth muscle and increases blood flow. By preventing cGMP breakdown, sildenafil amplifies this natural response.",
  },
  {
    name: "Tadalafil",
    aliases: ["tadalafil", "cialis"],
    synopsis:
      "A long-acting PDE5 inhibitor known as 'the weekend pill' due to its 36-hour duration. Also approved for daily use to treat both ED and benign prostatic hyperplasia.",
    whatItDoes:
      "Treats erectile dysfunction (on-demand or daily dosing), benign prostatic hyperplasia (urinary symptoms from enlarged prostate), and pulmonary arterial hypertension.",
    howItWorks:
      "Inhibits PDE5, preventing cGMP breakdown and enhancing nitric oxide-mediated smooth muscle relaxation. Its much longer half-life (17.5 hours vs. 4 hours for sildenafil) allows for more spontaneous timing. Daily low-dose also relaxes prostatic smooth muscle.",
  },

  // ── Sleep ──
  {
    name: "Zolpidem",
    aliases: ["zolpidem", "ambien", "ambien cr"],
    synopsis:
      "A non-benzodiazepine sedative-hypnotic (a 'Z-drug') used for short-term insomnia treatment. A Schedule IV controlled substance.",
    whatItDoes:
      "Helps with sleep onset (falling asleep). The extended-release form also helps with sleep maintenance. Should only be used short-term (2-4 weeks) due to dependence risk.",
    howItWorks:
      "Binds selectively to the alpha-1 subunit of the GABA-A receptor (the same target as benzodiazepines, but at a specific subtype). This selectivity produces sedation without the strong anti-anxiety, muscle relaxant, or anticonvulsant effects of benzodiazepines.",
  },
  {
    name: "Melatonin",
    aliases: ["melatonin"],
    synopsis:
      "A naturally occurring hormone sold as an over-the-counter dietary supplement for sleep. Regulates the circadian rhythm rather than directly inducing sedation.",
    whatItDoes:
      "Helps regulate the sleep-wake cycle. Most effective for circadian rhythm disorders (jet lag, shift work, delayed sleep phase). Modest benefit for general insomnia.",
    howItWorks:
      "Binds to melatonin MT1 and MT2 receptors in the suprachiasmatic nucleus (the body's master clock) in the hypothalamus. MT1 activation promotes sleepiness; MT2 activation shifts circadian phase timing. Signals to the brain that it is nighttime.",
  },
  {
    name: "Suvorexant",
    aliases: ["suvorexant", "belsomra"],
    synopsis:
      "An orexin receptor antagonist — a newer class of sleep medication that blocks the wake-promoting orexin system rather than enhancing sedation.",
    whatItDoes:
      "Treats insomnia characterized by difficulty falling asleep and/or staying asleep. Promotes natural sleep without the rebound insomnia and cognitive impairment associated with some other sleep aids.",
    howItWorks:
      "Blocks orexin (hypocretin) receptors OX1R and OX2R. The orexin system is a key wake-promoting pathway in the brain. By blocking these receptors, suvorexant reduces the drive to stay awake, allowing natural sleep processes to take over.",
  },

  // ── ADHD ──
  {
    name: "Methylphenidate",
    aliases: ["methylphenidate", "ritalin", "concerta", "focalin", "daytrana"],
    synopsis:
      "A central nervous system stimulant and the most commonly prescribed medication for ADHD. Available in many formulations providing 4-12 hours of coverage. A Schedule II controlled substance.",
    whatItDoes:
      "Improves attention, focus, and impulse control in ADHD. Reduces hyperactivity and improves academic and occupational performance. Also treats narcolepsy.",
    howItWorks:
      "Blocks the dopamine transporter (DAT) and norepinephrine transporter (NET), preventing reuptake of these neurotransmitters. Unlike amphetamines, it primarily works by blocking reuptake rather than increasing release. This increases dopamine and norepinephrine in the prefrontal cortex.",
  },
  {
    name: "Amphetamine/Dextroamphetamine",
    aliases: ["amphetamine", "dextroamphetamine", "adderall", "adderall xr", "mydayis"],
    synopsis:
      "A mixed amphetamine salt combination used for ADHD and narcolepsy. Contains four different amphetamine salts. A Schedule II controlled substance.",
    whatItDoes:
      "Treats ADHD by improving attention, concentration, and behavioral control. Also reduces excessive daytime sleepiness in narcolepsy. Available in immediate-release (4-6 hours) and extended-release (10-12 hours).",
    howItWorks:
      "Has a dual mechanism: (1) blocks dopamine and norepinephrine transporters (like methylphenidate) and (2) enters nerve terminals and reverses the transporters, actively pushing dopamine and norepinephrine into the synapse.",
  },
  {
    name: "Lisdexamfetamine",
    aliases: ["lisdexamfetamine", "vyvanse"],
    synopsis:
      "A prodrug of dextroamphetamine designed to have a smoother onset and lower abuse potential. The body must convert it to the active form, creating a built-in extended-release mechanism.",
    whatItDoes:
      "Treats ADHD in children and adults, and binge eating disorder. Provides up to 14 hours of symptom control with a smooth onset and offset.",
    howItWorks:
      "A lysine-conjugated form of dextroamphetamine. Red blood cells cleave the lysine amino acid to release active dextroamphetamine. This enzymatic conversion limits the rate of active drug release, preventing the rapid spike associated with abuse.",
  },
  {
    name: "Atomoxetine",
    aliases: ["atomoxetine", "strattera"],
    synopsis:
      "A non-stimulant ADHD medication that selectively inhibits norepinephrine reuptake. Not a controlled substance, making it an option when stimulants are contraindicated.",
    whatItDoes:
      "Treats ADHD in children and adults without the abuse potential of stimulants. Takes 4-6 weeks for full effect. 24-hour coverage with once-daily dosing.",
    howItWorks:
      "Selectively blocks the norepinephrine transporter (NET) in the prefrontal cortex. Since the prefrontal cortex lacks dopamine transporters, NET also clears dopamine there — so blocking NET increases both norepinephrine and dopamine in this region, improving attention and executive function.",
  },
  {
    name: "Guanfacine",
    aliases: ["guanfacine", "intuniv", "tenex"],
    synopsis:
      "An alpha-2A adrenergic agonist used for ADHD (extended-release, Intuniv) and high blood pressure (immediate-release, Tenex). A non-stimulant ADHD option.",
    whatItDoes:
      "Treats ADHD by improving working memory, reducing impulsivity, and enhancing attention. Also helps with tic disorders. Can be used alone or with stimulants.",
    howItWorks:
      "Stimulates postsynaptic alpha-2A adrenergic receptors in the prefrontal cortex, strengthening weak prefrontal network connections. This directly enhances prefrontal cortical function, improving attention, working memory, and behavioral regulation through a non-catecholamine-releasing mechanism.",
  },

  // ── Gout ──
  {
    name: "Allopurinol",
    aliases: ["allopurinol", "zyloprim", "aloprim"],
    synopsis:
      "The first-line medication for preventing gout attacks by lowering uric acid levels. Requires dose titration over weeks to months.",
    whatItDoes:
      "Lowers blood uric acid levels, preventing gout flares and formation of urate crystals in joints and kidneys. Can initially trigger gout flares as uric acid deposits are mobilized.",
    howItWorks:
      "Inhibits xanthine oxidase, the enzyme that converts hypoxanthine to xanthine and xanthine to uric acid. By blocking this final step in purine metabolism, it reduces uric acid production. Its active metabolite, oxypurinol, also inhibits xanthine oxidase.",
  },
  {
    name: "Colchicine",
    aliases: ["colchicine", "colcrys", "mitigare"],
    synopsis:
      "An ancient medication derived from the autumn crocus plant, used for centuries to treat gout. Now also used for pericarditis and familial Mediterranean fever.",
    whatItDoes:
      "Treats and prevents acute gout flares, treats pericarditis, and manages familial Mediterranean fever. Most effective when taken within the first 12-24 hours of a gout attack.",
    howItWorks:
      "Binds to tubulin and inhibits microtubule polymerization. This disrupts multiple inflammatory processes: prevents neutrophil migration to the inflamed joint, inhibits inflammasome activation (NLRP3), and reduces the release of inflammatory cytokines.",
  },

  // ── Hormonal / Reproductive ──
  {
    name: "Estradiol",
    aliases: ["estradiol", "estrace", "vivelle", "climara", "divigel"],
    synopsis:
      "The primary human estrogen, available as oral tablets, transdermal patches, topical gels, and vaginal preparations for hormone replacement therapy.",
    whatItDoes:
      "Treats menopausal symptoms (hot flashes, vaginal dryness, night sweats), prevents osteoporosis in postmenopausal women, and is used in transgender hormone therapy.",
    howItWorks:
      "Binds to estrogen receptors (ER-alpha and ER-beta) in target tissues, regulating gene expression. In the hypothalamus, reduces vasomotor symptoms. In bone, promotes osteoblast activity and inhibits osteoclasts. In the urogenital tract, maintains tissue health.",
  },
  {
    name: "Progesterone",
    aliases: ["progesterone", "prometrium", "provera", "medroxyprogesterone"],
    synopsis:
      "A female sex hormone essential for the menstrual cycle and pregnancy. Prescribed as natural progesterone or synthetic progestins for various gynecological conditions.",
    whatItDoes:
      "Protects the uterine lining from overgrowth when taking estrogen, supports pregnancy, treats abnormal uterine bleeding, and is used in hormonal contraception.",
    howItWorks:
      "Binds to progesterone receptors in the uterus, transforming the endometrial lining from a proliferative to a secretory state. This stabilizes the endometrium and opposes the stimulatory effects of estrogen.",
  },
  {
    name: "Testosterone",
    aliases: ["testosterone", "androgel", "testim", "depo-testosterone", "testosterone cypionate"],
    synopsis:
      "The primary male sex hormone, prescribed for testosterone deficiency (hypogonadism) in men and used in transgender hormone therapy.",
    whatItDoes:
      "Restores testosterone to normal levels, improving energy, libido, muscle mass, bone density, mood, and cognitive function in men with deficiency.",
    howItWorks:
      "Binds to androgen receptors in target tissues throughout the body, regulating gene transcription. Some effects require conversion to dihydrotestosterone (DHT) by 5-alpha reductase, while others require aromatization to estradiol.",
  },
  {
    name: "Ethinyl Estradiol / Norgestimate",
    aliases: ["ortho tri-cyclen", "sprintec", "tri-sprintec", "birth control", "oral contraceptive"],
    synopsis:
      "A combination oral contraceptive pill containing synthetic estrogen and progestin. One of the most commonly prescribed birth control pills.",
    whatItDoes:
      "Prevents pregnancy, regulates menstrual cycles, reduces acne, and decreases menstrual cramps. Also reduces the risk of ovarian and endometrial cancer with long-term use.",
    howItWorks:
      "Suppresses ovulation by inhibiting the hypothalamic-pituitary-ovarian axis (suppresses LH and FSH surges). Also thickens cervical mucus to block sperm, and thins the endometrial lining to reduce implantation likelihood.",
  },

  // ── Prostate ──
  {
    name: "Tamsulosin",
    aliases: ["tamsulosin", "flomax"],
    synopsis:
      "An alpha-1 blocker specifically designed for benign prostatic hyperplasia (BPH). More selective for the prostate than older alpha-blockers, causing less dizziness.",
    whatItDoes:
      "Relieves urinary symptoms of an enlarged prostate: difficulty starting urination, weak stream, frequent urination, urgency, and nighttime urination. Does not shrink the prostate.",
    howItWorks:
      "Selectively blocks alpha-1A adrenergic receptors concentrated in the prostate, bladder neck, and prostatic urethra. Relaxing this muscle reduces urethral constriction, improving urine flow. Its alpha-1A selectivity reduces the risk of hypotension.",
  },
  {
    name: "Finasteride",
    aliases: ["finasteride", "proscar", "propecia"],
    synopsis:
      "A 5-alpha reductase inhibitor used for both benign prostatic hyperplasia (BPH, as Proscar 5mg) and male pattern hair loss (as Propecia 1mg).",
    whatItDoes:
      "Shrinks the prostate gland by ~25% over 6-12 months, improving urinary symptoms. At lower doses, slows hair loss and can regrow hair.",
    howItWorks:
      "Inhibits type II 5-alpha reductase, the enzyme that converts testosterone to dihydrotestosterone (DHT) in the prostate and hair follicles. DHT is the primary androgen driving prostate growth and male pattern baldness. Finasteride reduces DHT levels by ~70%.",
  },

  // ── Autoimmune / Immunosuppressants ──
  {
    name: "Methotrexate",
    aliases: ["methotrexate", "trexall", "rasuvo", "otrexup"],
    synopsis:
      "An immunosuppressant and anti-metabolite used at low doses for autoimmune diseases and at high doses for cancer. The anchor drug for rheumatoid arthritis treatment.",
    whatItDoes:
      "Treats rheumatoid arthritis, psoriasis, psoriatic arthritis, and certain cancers (leukemia, lymphoma). Reduces joint damage and disability in RA. Taken weekly for autoimmune conditions.",
    howItWorks:
      "At low (immunosuppressive) doses: inhibits dihydrofolate reductase and promotes adenosine release, which has anti-inflammatory effects. At high (anticancer) doses: blocks folate-dependent enzymes needed for DNA synthesis, preventing rapidly dividing cell proliferation.",
  },
  {
    name: "Adalimumab",
    aliases: ["adalimumab", "humira"],
    synopsis:
      "A fully human monoclonal antibody targeting TNF-alpha. Was the world's best-selling drug for nearly a decade. Now available as biosimilars.",
    whatItDoes:
      "Treats rheumatoid arthritis, psoriasis, Crohn's disease, ulcerative colitis, ankylosing spondylitis, and juvenile idiopathic arthritis. Reduces inflammation and prevents disease progression.",
    howItWorks:
      "Binds to and neutralizes tumor necrosis factor-alpha (TNF-alpha), a key inflammatory cytokine. TNF-alpha drives inflammation in many autoimmune conditions by activating immune cells, promoting cell adhesion molecule expression, and inducing other inflammatory cytokines.",
  },

  // ── Skin ──
  {
    name: "Tretinoin",
    aliases: ["tretinoin", "retin-a", "retin a", "renova"],
    synopsis:
      "A topical retinoid (vitamin A derivative) used to treat acne and signs of skin aging. The gold standard topical treatment for both conditions.",
    whatItDoes:
      "Treats acne by unclogging pores and preventing new acne lesions. Also reduces fine wrinkles, rough skin, and hyperpigmentation from sun damage. Takes 8-12 weeks for full benefit.",
    howItWorks:
      "Binds to retinoic acid receptors (RARs) in skin cells, modifying gene expression to increase skin cell turnover, promote exfoliation of dead cells from within pores, stimulate collagen production, and improve skin texture and tone.",
  },

  // ── Iron / Vitamins ──
  {
    name: "Ferrous Sulfate",
    aliases: ["ferrous sulfate", "iron", "iron supplement", "fer-in-sol"],
    synopsis:
      "The most commonly prescribed oral iron supplement for iron-deficiency anemia. Inexpensive and effective but can cause significant gastrointestinal side effects.",
    whatItDoes:
      "Replenishes iron stores and treats iron-deficiency anemia. Improves energy, reduces fatigue, and restores normal red blood cell production. Takes several months to fully replete iron stores.",
    howItWorks:
      "Provides elemental iron (ferrous form) that is absorbed in the duodenum and upper jejunum. Iron is incorporated into hemoglobin in developing red blood cells in the bone marrow, restoring oxygen-carrying capacity. Excess iron is stored as ferritin.",
  },
  {
    name: "Vitamin D",
    aliases: ["vitamin d", "cholecalciferol", "ergocalciferol", "vitamin d3", "vitamin d2"],
    synopsis:
      "A fat-soluble vitamin essential for calcium absorption and bone health. Widely supplemented because deficiency is extremely common, especially in northern climates.",
    whatItDoes:
      "Promotes calcium absorption in the gut, maintains bone mineralization, supports immune function, and may reduce the risk of certain diseases. Treats and prevents vitamin D deficiency and rickets.",
    howItWorks:
      "Converted in the liver to 25-hydroxyvitamin D (calcifediol), then in the kidneys to the active form 1,25-dihydroxyvitamin D (calcitriol). Calcitriol binds to vitamin D receptors (VDR) in the intestine to increase calcium absorption and in bone to regulate mineralization.",
  },
];

/**
 * Look up medication info by name.
 * Performs case-insensitive matching against both the canonical name and aliases.
 */
export function findMedicationInfo(medName: string): MedicationInfo | null {
  const lower = medName.toLowerCase();
  return (
    MEDICATION_DATA.find(
      (m) =>
        m.name.toLowerCase() === lower ||
        m.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))
    ) ?? null
  );
}

export default MEDICATION_DATA;
