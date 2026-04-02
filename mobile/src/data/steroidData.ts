/**
 * Steroid data bank — reference information for common anabolic-androgenic steroids and related compounds.
 *
 * Each entry includes a brief synopsis (what the compound is),
 * what it does (effects and benefits), and how it works (mechanism of action).
 */

export interface SteroidInfo {
  name: string;
  aliases: string[];
  synopsis: string;
  whatItDoes: string;
  howItWorks: string;
}

const STEROID_DATA: SteroidInfo[] = [
  // ── Testosterone Esters ──
  {
    name: "Testosterone Cypionate",
    aliases: ["test cyp", "test c", "testosterone cypionate", "cyp"],
    synopsis:
      "A long-acting esterified form of testosterone, the primary male sex hormone. It is one of the most commonly prescribed forms of testosterone replacement therapy (TRT) and is administered via intramuscular injection.",
    whatItDoes:
      "Restores physiological testosterone levels in hypogonadal men, promoting increases in muscle mass, strength, bone mineral density, and libido. Improves mood, energy levels, and red blood cell production. At supraphysiological doses, it significantly enhances protein synthesis and nitrogen retention, driving accelerated muscle growth and recovery.",
    howItWorks:
      "Once injected, the cypionate ester is cleaved by esterase enzymes in the bloodstream, releasing free testosterone over approximately 7–10 days. Free testosterone binds to the androgen receptor (AR) in skeletal muscle, bone, and other tissues, activating gene transcription that increases protein synthesis. It also undergoes 5-alpha reduction to dihydrotestosterone (DHT) and aromatization to estradiol, contributing to androgenic and estrogenic effects respectively.",
  },
  {
    name: "Testosterone Enanthate",
    aliases: ["test e", "test enanthate", "testosterone enanthate"],
    synopsis:
      "A long-acting testosterone ester with a pharmacokinetic profile very similar to testosterone cypionate. It is widely used worldwide for testosterone replacement therapy and is one of the oldest esterified testosterone preparations.",
    whatItDoes:
      "Produces the same physiological and supraphysiological effects as other testosterone esters — increased muscle mass, strength, bone density, red blood cell production, and improved libido and mood. Its slightly shorter ester chain compared to cypionate results in a marginally faster release, though in practice the two are considered interchangeable.",
    howItWorks:
      "The enanthate ester is hydrolyzed in vivo to release free testosterone over approximately 5–8 days. Free testosterone binds to intracellular androgen receptors, translocating to the nucleus where it modulates gene expression involved in protein synthesis, nitrogen retention, and satellite cell activation. Like all exogenous testosterone, it suppresses the hypothalamic-pituitary-gonadal (HPG) axis via negative feedback on GnRH and LH secretion.",
  },

  // ── 19-Nortestosterone Derivatives ──
  {
    name: "Nandrolone Decanoate",
    aliases: ["deca", "deca durabolin", "nandrolone", "nandrolone decanoate"],
    synopsis:
      "A 19-nortestosterone derivative with a long-acting decanoate ester, marketed under the brand name Deca-Durabolin. It is one of the most widely studied anabolic steroids and has established medical uses for anemia, osteoporosis, and muscle-wasting conditions.",
    whatItDoes:
      "Promotes significant lean muscle mass gains with less androgenic activity relative to testosterone. Enhances collagen synthesis and increases bone mineral content, making it popular for joint health and recovery. It also stimulates erythropoietin production, increasing red blood cell count and improving oxygen delivery to tissues.",
    howItWorks:
      "Nandrolone binds to the androgen receptor with high affinity but is reduced by 5-alpha reductase to dihydronandrolone (DHN), a weaker androgen than DHT, which accounts for its lower androgenic side effect profile. It strongly promotes nitrogen retention and protein synthesis in skeletal muscle. Nandrolone also enhances collagen synthesis by stimulating type III collagen production and increases synovial fluid production, contributing to its joint-protective properties.",
  },
  {
    name: "Trenbolone Acetate",
    aliases: ["tren", "tren a", "tren ace", "trenbolone", "trenbolone acetate"],
    synopsis:
      "A potent 19-nortestosterone derivative with a short-acting acetate ester, originally developed for veterinary use to increase feed efficiency and muscle growth in cattle. It is considered one of the most powerful anabolic steroids available.",
    whatItDoes:
      "Produces dramatic increases in muscle mass, strength, and muscle hardness while simultaneously promoting fat loss through nutrient partitioning. It does not aromatize to estrogen, eliminating water retention and gynecomastia risk from estrogenic pathways. However, it carries a significant side effect burden including insomnia, night sweats, cardiovascular strain, and potential neurotoxicity.",
    howItWorks:
      "Trenbolone binds to the androgen receptor approximately five times more strongly than testosterone, driving potent anabolic signaling. It increases IGF-1 expression in muscle tissue and inhibits glucocorticoid receptor activation, reducing muscle catabolism. Trenbolone also strongly binds to the progesterone receptor, and its metabolites may interact with mineralocorticoid and glucocorticoid receptors, contributing to its broad and potent physiological effects.",
  },

  // ── Oral Anabolic Steroids ──
  {
    name: "Oxandrolone",
    aliases: ["anavar", "oxandrolone", "var"],
    synopsis:
      "A synthetic oral anabolic steroid derived from dihydrotestosterone (DHT). It is FDA-approved for weight regain after surgery, chronic infection, trauma, and for the treatment of bone pain associated with osteoporosis.",
    whatItDoes:
      "Promotes lean muscle gain and strength increases with minimal water retention, making it favored during cutting phases. It enhances fat oxidation, particularly visceral fat, and has a relatively mild side effect profile compared to other oral steroids. It is one of the few anabolic steroids with clinical evidence supporting its use in burn patients and those recovering from severe weight loss.",
    howItWorks:
      "As a DHT derivative, oxandrolone cannot be aromatized to estrogen, eliminating estrogenic side effects. It binds directly to the androgen receptor to stimulate protein synthesis and nitrogen retention. Oxandrolone increases phosphocreatine synthesis within muscle cells, enhancing ATP regeneration and contributing to strength gains. Its 17-alpha-alkylation allows oral bioavailability but imparts some degree of hepatotoxicity, though less than most other C17-alpha alkylated steroids.",
  },
  {
    name: "Stanozolol",
    aliases: ["winstrol", "winny", "stanozolol"],
    synopsis:
      "A synthetic DHT-derived anabolic steroid available in both oral and injectable (aqueous suspension) forms. It gained widespread notoriety after the Ben Johnson doping scandal at the 1988 Olympics and is FDA-approved for the treatment of hereditary angioedema.",
    whatItDoes:
      "Increases muscle hardness, vascularity, and strength without significant water retention or estrogenic side effects. Lowers sex hormone-binding globulin (SHBG) levels substantially, increasing the proportion of free testosterone. It is commonly used during cutting phases for its physique-hardening effects, but it carries notable risks to joint health due to its drying effects on synovial fluid.",
    howItWorks:
      "Stanozolol is a heterocyclic steroid with a pyrazole ring fused to the A-ring of the steroid nucleus, giving it unique receptor binding properties. It binds to the androgen receptor to promote anabolic effects and strongly suppresses SHBG production in the liver. Unlike many anabolic steroids, stanozolol also has documented anti-progestational activity and stimulates collagen synthesis, though paradoxically it may weaken tendons by altering their structural composition.",
  },
  {
    name: "Methandrostenolone",
    aliases: ["dianabol", "dbol", "methandrostenolone"],
    synopsis:
      "One of the first orally active anabolic steroids ever developed, created by Dr. John Ziegler in the late 1950s for the U.S. Olympic team. It rapidly became the most popular oral steroid worldwide and remains widely used for its potent mass-building effects.",
    whatItDoes:
      "Produces rapid and substantial gains in muscle mass, strength, and overall body weight, largely due to increased protein synthesis and significant glycogen and water retention within muscle cells. It dramatically enhances training recovery and workout intensity. However, it aromatizes heavily and is C17-alpha alkylated, carrying meaningful estrogenic and hepatotoxic risk.",
    howItWorks:
      "Methandrostenolone binds to the androgen receptor to activate anabolic gene transcription, but it also exerts non-genomic effects that enhance glycogenolysis and intracellular water retention. It aromatizes readily via the aromatase enzyme to methylestradiol, a potent estrogen, contributing to water retention and gynecomastia risk. Its 17-alpha methyl group provides oral bioavailability but subjects the liver to first-pass metabolic stress, necessitating limited cycle durations.",
  },
  {
    name: "Oxymetholone",
    aliases: ["anadrol", "a50", "oxymetholone"],
    synopsis:
      "A potent oral anabolic steroid and one of the strongest mass-building compounds available. It is FDA-approved for the treatment of anemia caused by deficient red blood cell production, including aplastic anemia and myelofibrosis.",
    whatItDoes:
      "Produces rapid and dramatic gains in muscle mass and strength, often 10–15 pounds within the first few weeks of use. Significantly stimulates erythropoiesis, increasing red blood cell count and hemoglobin levels. Despite not aromatizing directly, it causes substantial water retention and estrogenic side effects through mechanisms that are not fully understood, possibly involving direct activation of the estrogen receptor.",
    howItWorks:
      "Oxymetholone binds to the androgen receptor to drive protein synthesis and nitrogen retention. It stimulates erythropoietin (EPO) production by the kidneys, markedly increasing red blood cell output. Uniquely, although it is a DHT derivative and cannot undergo aromatization, it or its metabolites may directly activate estrogen receptors, explaining the estrogenic side effects observed clinically. Its C17-alpha alkylation confers significant hepatotoxicity, requiring careful monitoring of liver function.",
  },

  // ── Injectable Anabolic Steroids ──
  {
    name: "Boldenone Undecylenate",
    aliases: ["equipoise", "eq", "boldenone", "boldenone undecylenate"],
    synopsis:
      "A testosterone derivative with a double bond between carbons 1 and 2, attached to a long-acting undecylenate ester. Originally developed for veterinary use under the brand name Equipoise, it has no approved human medical applications but is widely used in performance enhancement.",
    whatItDoes:
      "Produces slow, steady gains in lean muscle mass with enhanced vascularity and a modest increase in appetite. Significantly increases red blood cell production — more so than most other anabolic steroids — improving endurance and oxygen delivery. It provides a drier, more aesthetic look compared to testosterone due to lower estrogenic conversion, making it popular during lean-bulking and pre-contest phases.",
    howItWorks:
      "Boldenone binds to the androgen receptor to stimulate protein synthesis and nitrogen retention. Its 1,2-double bond reduces its affinity for the aromatase enzyme, resulting in approximately 50% less estrogen conversion compared to testosterone. It potently stimulates erythropoietin (EPO) production by the kidneys, leading to significant increases in hematocrit and hemoglobin. The undecylenate ester provides a very long half-life of approximately 14 days, requiring extended cycle durations for stable blood levels.",
  },
  {
    name: "Drostanolone Propionate",
    aliases: ["masteron", "mast", "drostanolone"],
    synopsis:
      "A DHT-derived injectable anabolic steroid with a short-acting propionate ester, originally developed as a breast cancer treatment under the brand name Masteron. It has fallen out of clinical use but remains popular in competitive bodybuilding.",
    whatItDoes:
      "Produces a hard, dense, and dry muscular appearance by reducing subcutaneous water retention. Acts as a mild aromatase inhibitor, reducing estrogenic side effects when used alongside aromatizable compounds. Provides moderate strength gains and muscle preservation during caloric deficit, making it a staple in pre-contest and cutting protocols.",
    howItWorks:
      "As a DHT derivative, drostanolone cannot be aromatized to estrogen and instead competitively inhibits the aromatase enzyme, reducing circulating estrogen levels. It binds strongly to the androgen receptor in muscle tissue, promoting protein synthesis and anti-catabolic effects. Its anti-estrogenic properties were the basis for its original medical indication in estrogen receptor-positive breast cancer, where reducing estrogenic stimulation is therapeutically beneficial.",
  },
  {
    name: "Methenolone Enanthate",
    aliases: ["primobolan", "primo", "methenolone"],
    synopsis:
      "A DHT-derived anabolic steroid with a long-acting enanthate ester, considered one of the mildest and safest injectable steroids available. It was reportedly Arnold Schwarzenegger's preferred compound and remains highly sought after for its favorable risk-to-benefit profile.",
    whatItDoes:
      "Promotes slow but high-quality lean muscle gains with virtually no water retention or estrogenic side effects. Enhances nitrogen retention and immune function while preserving muscle mass during caloric restriction. It is favored during cutting phases and by athletes seeking performance enhancement with a lower side effect burden, though its anabolic potency is relatively modest.",
    howItWorks:
      "Methenolone binds to the androgen receptor to stimulate protein synthesis, though with lower binding affinity than many other anabolic steroids. As a DHT derivative, it cannot aromatize to estrogen, eliminating estrogenic side effects entirely. It has a strong affinity for binding to SHBG, and it enhances cellular immunity by promoting T-lymphocyte activity. The enanthate ester provides a half-life of approximately 7–10 days, allowing for weekly injection frequencies.",
  },

  // ── Growth Hormone ──
  {
    name: "Human Growth Hormone",
    aliases: ["hgh", "growth hormone", "somatropin"],
    synopsis:
      "A 191-amino acid recombinant protein identical to endogenous pituitary growth hormone. It is FDA-approved for growth hormone deficiency in children and adults, Turner syndrome, chronic kidney disease, and HIV-associated wasting.",
    whatItDoes:
      "Stimulates growth of virtually all tissues including skeletal muscle and bone. Promotes lipolysis (fat breakdown), particularly visceral fat, while enhancing lean body mass and connective tissue strength. Improves skin quality, sleep architecture, and recovery from injury. At higher doses, it can cause water retention, joint pain, carpal tunnel syndrome, and may increase the risk of insulin resistance and type 2 diabetes.",
    howItWorks:
      "HGH binds to the growth hormone receptor (GHR) on target cells, activating the JAK2-STAT5 signaling pathway that stimulates transcription of insulin-like growth factor 1 (IGF-1) primarily in the liver. IGF-1 mediates many of the anabolic effects of HGH, including stimulation of chondrocyte and osteoblast proliferation, satellite cell activation in skeletal muscle, and increased amino acid uptake. HGH also has direct lipolytic effects by activating hormone-sensitive lipase in adipocytes and antagonizing insulin's lipogenic actions.",
  },
];

export function findSteroidInfo(name: string): SteroidInfo | null {
  const lower = name.toLowerCase().trim();
  return (
    STEROID_DATA.find(
      (s) =>
        s.name.toLowerCase() === lower ||
        s.aliases.some((a) => lower.includes(a) || a.includes(lower))
    ) || null
  );
}

export default STEROID_DATA;
