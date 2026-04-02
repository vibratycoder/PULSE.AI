/**
 * Vaccine data bank — reference information for common vaccines.
 *
 * Each entry includes a brief synopsis, what it protects against,
 * and the value / importance of the vaccine.
 */

export interface VaccineInfo {
  name: string;
  aliases: string[];
  synopsis: string;
  protectsAgainst: string;
  value: string;
}

const VACCINE_DATA: VaccineInfo[] = [
  // ── Routine Adult Vaccines ──
  {
    name: "COVID-19",
    aliases: ["covid", "covid-19", "covid19", "sars-cov-2", "coronavirus vaccine", "moderna", "pfizer", "biontech", "novavax"],
    synopsis:
      "An mRNA, viral vector, or protein subunit vaccine developed to combat the SARS-CoV-2 virus. Updated formulations target circulating variants.",
    protectsAgainst:
      "COVID-19 disease caused by the SARS-CoV-2 virus, including severe illness, hospitalization, and death.",
    value:
      "Dramatically reduces the risk of severe COVID-19 outcomes, hospitalization, and death, especially in older adults and immunocompromised individuals. Helps reduce community transmission.",
  },
  {
    name: "Flu (Influenza)",
    aliases: ["flu", "influenza", "flu shot", "flu vaccine", "influenza vaccine", "fluzone", "flublok", "fluad"],
    synopsis:
      "A seasonal vaccine reformulated annually to match circulating influenza virus strains. Available as inactivated, recombinant, or live attenuated (nasal spray) formulations.",
    protectsAgainst:
      "Seasonal influenza A and B viruses, which cause respiratory illness, fever, body aches, and potentially life-threatening complications.",
    value:
      "Prevents millions of illnesses and tens of thousands of deaths each year. Particularly critical for young children, older adults, pregnant women, and those with chronic health conditions.",
  },
  {
    name: "Tdap",
    aliases: ["tdap", "tetanus", "diphtheria", "pertussis", "whooping cough", "boostrix", "adacel"],
    synopsis:
      "A combination vaccine providing protection against tetanus, diphtheria, and pertussis (whooping cough). Recommended as a single booster dose for adolescents and adults, and during each pregnancy.",
    protectsAgainst:
      "Tetanus (lockjaw), diphtheria (throat and heart infection), and pertussis (whooping cough).",
    value:
      "Prevents three serious bacterial diseases. Particularly important during pregnancy to pass protective antibodies to newborns who are too young to be vaccinated against pertussis.",
  },
  {
    name: "Shingles (Zoster)",
    aliases: ["shingles", "zoster", "herpes zoster", "shingrix", "zoster vaccine"],
    synopsis:
      "A recombinant adjuvanted vaccine (Shingrix) recommended for adults 50 and older. Given as a two-dose series to prevent reactivation of the varicella-zoster virus.",
    protectsAgainst:
      "Shingles (herpes zoster), a painful blistering rash caused by reactivation of the chickenpox virus, and postherpetic neuralgia (chronic nerve pain after shingles).",
    value:
      "Over 90% effective at preventing shingles and its most debilitating complication, postherpetic neuralgia. Shingles affects roughly one in three adults in their lifetime.",
  },
  {
    name: "Pneumococcal (Pneumonia)",
    aliases: ["pneumococcal", "pneumonia", "pneumovax", "pneumonia vaccine", "ppsv23"],
    synopsis:
      "A polysaccharide vaccine (PPSV23/Pneumovax 23) that covers 23 serotypes of Streptococcus pneumoniae. Recommended for adults 65 and older and younger adults with certain risk factors.",
    protectsAgainst:
      "Pneumococcal pneumonia, bacteremia (bloodstream infection), and meningitis caused by Streptococcus pneumoniae.",
    value:
      "Pneumococcal disease kills thousands of adults annually. Vaccination is especially important for older adults and those with chronic lung, heart, or liver disease, diabetes, or immunocompromising conditions.",
  },
  {
    name: "Hepatitis A",
    aliases: ["hepatitis a", "hep a", "havrix", "vaqta", "hep a vaccine"],
    synopsis:
      "An inactivated virus vaccine given as a two-dose series. Provides long-lasting immunity against the hepatitis A virus, which spreads through contaminated food and water.",
    protectsAgainst:
      "Hepatitis A virus infection, which causes acute liver inflammation, jaundice, fatigue, nausea, and abdominal pain.",
    value:
      "Provides near-complete protection after two doses. Essential for travelers to endemic regions and important for preventing outbreaks linked to contaminated food or water supplies.",
  },
  {
    name: "Hepatitis B",
    aliases: ["hepatitis b", "hep b", "engerix-b", "recombivax", "heplisav-b", "hep b vaccine"],
    synopsis:
      "A recombinant vaccine given as a two- or three-dose series. Now recommended for all adults through age 59, and older adults with risk factors. Part of the routine childhood schedule.",
    protectsAgainst:
      "Hepatitis B virus infection, which can cause chronic liver disease, cirrhosis, and hepatocellular carcinoma (liver cancer).",
    value:
      "One of the first vaccines proven to prevent cancer. Chronic hepatitis B affects over 250 million people globally and is a leading cause of liver cancer and liver failure.",
  },
  {
    name: "HPV",
    aliases: ["hpv", "human papillomavirus", "gardasil", "gardasil 9", "cervarix", "hpv vaccine"],
    synopsis:
      "A recombinant vaccine (Gardasil 9) covering nine HPV types. Recommended for adolescents at age 11-12 and available through age 45. Given as a two- or three-dose series depending on age.",
    protectsAgainst:
      "Human papillomavirus types that cause cervical, anal, oropharyngeal, penile, vaginal, and vulvar cancers, as well as genital warts.",
    value:
      "Prevents approximately 90% of HPV-related cancers. One of the most effective cancer-prevention tools available, with the potential to virtually eliminate cervical cancer over time.",
  },
  {
    name: "MMR",
    aliases: ["mmr", "measles", "mumps", "rubella", "m-m-r ii", "priorix", "mmr vaccine"],
    synopsis:
      "A live attenuated combination vaccine protecting against three viral diseases. Typically given as two doses in childhood, with catch-up vaccination available for adults lacking immunity.",
    protectsAgainst:
      "Measles (high fever, rash, pneumonia, encephalitis), mumps (salivary gland swelling, meningitis, orchitis), and rubella (German measles, dangerous congenital defects if contracted during pregnancy).",
    value:
      "Measles is one of the most contagious diseases known and was responsible for millions of deaths before vaccination. Two doses provide 97% protection against measles and at least 88% against mumps.",
  },
  {
    name: "Meningococcal",
    aliases: ["meningococcal", "meningitis", "menactra", "menveo", "menquadfi", "bexsero", "trumenba", "meningococcal vaccine"],
    synopsis:
      "Vaccines against Neisseria meningitidis, available as conjugate (MenACWY) and serogroup B (MenB) formulations. MenACWY is routinely recommended for adolescents; MenB is based on shared clinical decision-making.",
    protectsAgainst:
      "Meningococcal meningitis and septicemia (bloodstream infection), which can progress rapidly to death or permanent disability within hours.",
    value:
      "Meningococcal disease has a fatality rate of 10-15% even with treatment, and 10-20% of survivors suffer permanent sequelae such as limb amputation, hearing loss, or brain damage. Vaccination is the best prevention.",
  },
  {
    name: "Varicella (Chickenpox)",
    aliases: ["varicella", "chickenpox", "chicken pox", "varivax", "varicella vaccine"],
    synopsis:
      "A live attenuated vaccine given as two doses in childhood. Also recommended for adults without evidence of immunity. Prevents primary varicella-zoster virus infection.",
    protectsAgainst:
      "Chickenpox (varicella), which causes an itchy blistering rash, fever, and can lead to serious complications including bacterial skin infections, pneumonia, and encephalitis.",
    value:
      "Before the vaccine, chickenpox caused roughly 4 million cases, 10,000 hospitalizations, and 100-150 deaths annually in the US alone. Two doses are approximately 98% effective at preventing severe disease.",
  },

  // ── Childhood Vaccines ──
  {
    name: "Polio (IPV)",
    aliases: ["polio", "ipv", "inactivated polio", "poliovirus", "ipol", "polio vaccine"],
    synopsis:
      "An inactivated poliovirus vaccine given as a four-dose series in childhood. The oral live vaccine (OPV) is used in some countries but IPV is standard in the US and many developed nations.",
    protectsAgainst:
      "Poliomyelitis, a viral disease that attacks the nervous system and can cause irreversible paralysis and death.",
    value:
      "Polio vaccination has reduced global cases by over 99% since 1988. Continued vaccination is essential to achieve complete eradication and prevent resurgence of this devastating disease.",
  },
  {
    name: "Rotavirus",
    aliases: ["rotavirus", "rotateq", "rotarix", "rotavirus vaccine"],
    synopsis:
      "A live oral vaccine given to infants in two or three doses starting at 2 months of age. Protects against the most common cause of severe diarrhea in young children worldwide.",
    protectsAgainst:
      "Rotavirus gastroenteritis, which causes severe watery diarrhea, vomiting, fever, and dehydration in infants and young children.",
    value:
      "Before the vaccine, rotavirus caused over 200,000 emergency visits and 55,000-70,000 hospitalizations annually among US children under 5. The vaccine has reduced hospitalizations by 85-98%.",
  },
  {
    name: "Hib",
    aliases: ["hib", "haemophilus influenzae type b", "haemophilus influenzae", "acthib", "pedvaxhib", "hib vaccine"],
    synopsis:
      "A conjugate vaccine given as a three- or four-dose series in infancy. Protects against a bacterium that once was the leading cause of bacterial meningitis in children under 5.",
    protectsAgainst:
      "Haemophilus influenzae type b infections including bacterial meningitis, epiglottitis, pneumonia, septic arthritis, and bloodstream infections.",
    value:
      "Before the vaccine, Hib caused approximately 20,000 cases of invasive disease and 1,000 deaths annually in US children. The vaccine has reduced Hib disease by over 99% in vaccinated populations.",
  },
  {
    name: "DTaP",
    aliases: ["dtap", "daptacel", "infanrix", "dtap vaccine"],
    synopsis:
      "A combination vaccine for children under 7, given as a five-dose series. Contains diphtheria and tetanus toxoids and acellular pertussis antigens. The childhood equivalent of Tdap.",
    protectsAgainst:
      "Diphtheria (throat membrane and toxin), tetanus (lockjaw from wound contamination), and pertussis (whooping cough), all of which can be fatal in young children.",
    value:
      "These three diseases were major killers of children before widespread vaccination. DTaP maintains high community protection and is a cornerstone of the childhood immunization schedule.",
  },

  // ── Travel Vaccines ──
  {
    name: "Japanese Encephalitis",
    aliases: ["japanese encephalitis", "je vaccine", "ixiaro", "je"],
    synopsis:
      "An inactivated virus vaccine given as a two-dose series. Recommended for travelers spending extended time in rural areas of Asia and the Western Pacific where the virus is endemic.",
    protectsAgainst:
      "Japanese encephalitis virus, transmitted by Culex mosquitoes, which causes brain inflammation (encephalitis) with a 20-30% fatality rate among those who develop symptoms.",
    value:
      "Although most infections are asymptomatic, symptomatic Japanese encephalitis carries a high fatality rate and 30-50% of survivors have permanent neurological damage. Vaccination is the most reliable prevention for travelers to endemic regions.",
  },
  {
    name: "Yellow Fever",
    aliases: ["yellow fever", "yf-vax", "stamaril", "yellow fever vaccine"],
    synopsis:
      "A live attenuated vaccine given as a single dose, providing lifelong immunity for most recipients. Required for entry into certain countries in Africa and South America.",
    protectsAgainst:
      "Yellow fever virus, a mosquito-borne flavivirus that causes hemorrhagic fever, jaundice, organ failure, and death in severe cases.",
    value:
      "Yellow fever has a case fatality rate of 20-50% in severe cases. A single dose of vaccine provides effective protection for life, and proof of vaccination is an international travel requirement for many countries.",
  },
  {
    name: "Typhoid",
    aliases: ["typhoid", "typhoid fever", "typhim vi", "vivotif", "typhoid vaccine", "salmonella typhi"],
    synopsis:
      "Available as an injectable polysaccharide vaccine (one dose) or oral live attenuated vaccine (four capsules). Recommended for travelers to areas with poor sanitation where typhoid is common.",
    protectsAgainst:
      "Typhoid fever caused by Salmonella typhi, which spreads through contaminated food and water and causes high fever, weakness, stomach pain, and potentially fatal intestinal perforation.",
    value:
      "Typhoid affects an estimated 11-20 million people annually worldwide. Vaccination, combined with safe food and water practices, significantly reduces the risk for travelers to endemic regions.",
  },
  {
    name: "Rabies",
    aliases: ["rabies", "rabavert", "imovax", "rabies vaccine"],
    synopsis:
      "An inactivated virus vaccine given as a pre-exposure series (two or three doses) for those at high risk, or as a post-exposure series after a potential rabies exposure from an animal bite.",
    protectsAgainst:
      "Rabies virus, a nearly 100% fatal viral encephalitis transmitted through bites or scratches from infected mammals (dogs, bats, raccoons, foxes).",
    value:
      "Rabies is almost universally fatal once symptoms appear. Pre-exposure vaccination simplifies post-exposure treatment, and timely post-exposure prophylaxis is nearly 100% effective at preventing disease.",
  },
  {
    name: "Cholera",
    aliases: ["cholera", "vaxchora", "dukoral", "cholera vaccine"],
    synopsis:
      "An oral vaccine (Vaxchora in the US) given as a single dose. Recommended for adult travelers to areas with active cholera transmission.",
    protectsAgainst:
      "Cholera, a severe diarrheal disease caused by Vibrio cholerae bacteria, which spreads through contaminated water and can cause fatal dehydration within hours.",
    value:
      "Cholera kills an estimated 21,000-143,000 people annually. Vaccination provides an additional layer of protection alongside safe water and sanitation practices for travelers to endemic areas and during outbreaks.",
  },

  // ── Specialized / Military / Outbreak Vaccines ──
  {
    name: "Anthrax",
    aliases: ["anthrax", "biothrax", "cyfendus", "anthrax vaccine", "ava"],
    synopsis:
      "An adsorbed vaccine given as a multi-dose series primarily to military personnel and laboratory workers handling Bacillus anthracis. Also used as post-exposure prophylaxis alongside antibiotics.",
    protectsAgainst:
      "Anthrax, a serious infection caused by Bacillus anthracis spores, which can present as cutaneous, inhalation, or gastrointestinal disease. Inhalation anthrax is frequently fatal without treatment.",
    value:
      "Critical for biodefense preparedness. Inhalation anthrax has a fatality rate exceeding 80% without treatment. The vaccine is a key component of protection for at-risk military and laboratory personnel.",
  },
  {
    name: "Smallpox",
    aliases: ["smallpox", "smallpox vaccine", "acam2000", "jynneos", "variola", "vaccinia"],
    synopsis:
      "A live vaccinia virus vaccine. Smallpox was declared eradicated in 1980, but the vaccine remains stockpiled for bioterrorism preparedness. JYNNEOS (a newer, non-replicating vaccine) is also used for mpox.",
    protectsAgainst:
      "Smallpox (variola virus), a historically devastating disease with a 30% fatality rate. Also provides cross-protection against mpox and other orthopoxviruses.",
    value:
      "Smallpox vaccination led to the first and only eradication of a human disease. Maintained stockpiles and ongoing readiness are essential for biodefense, and the platform has proven valuable against mpox outbreaks.",
  },
  {
    name: "BCG (Tuberculosis)",
    aliases: ["bcg", "tuberculosis", "tb vaccine", "bacillus calmette-guerin", "bcg vaccine"],
    synopsis:
      "A live attenuated vaccine derived from Mycobacterium bovis. Given at birth or in infancy in countries with high TB burden. Not routinely used in the US due to low TB prevalence and variable adult efficacy.",
    protectsAgainst:
      "Severe forms of tuberculosis in children, including tuberculous meningitis and miliary (disseminated) TB. Less effective at preventing pulmonary TB in adults.",
    value:
      "TB remains one of the leading infectious disease killers worldwide. BCG is one of the most widely administered vaccines globally, providing critical protection for children in high-burden countries.",
  },
  {
    name: "Dengue",
    aliases: ["dengue", "dengvaxia", "dengue vaccine", "qdenga"],
    synopsis:
      "A live attenuated vaccine (Dengvaxia or Qdenga) for dengue fever. Dengvaxia is approved for individuals aged 9-16 with prior confirmed dengue infection in endemic areas. Qdenga does not require prior infection.",
    protectsAgainst:
      "Dengue fever and severe dengue (dengue hemorrhagic fever/dengue shock syndrome), caused by four serotypes of the dengue virus transmitted by Aedes mosquitoes.",
    value:
      "Dengue infects an estimated 390 million people annually. Severe dengue can be fatal, especially in children. Vaccination helps reduce hospitalizations and severe disease in endemic populations.",
  },
  {
    name: "Ebola",
    aliases: ["ebola", "ervebo", "ebola vaccine", "rvsvdg-zebov-gp"],
    synopsis:
      "A live recombinant vesicular stomatitis virus-based vaccine (Ervebo) given as a single dose. Approved for adults 18 and older at risk of Ebola virus disease.",
    protectsAgainst:
      "Ebola virus disease (Zaire ebolavirus species), a severe and often fatal hemorrhagic fever with fatality rates historically ranging from 25% to 90%.",
    value:
      "Ebola outbreaks have caused devastating mortality in West and Central Africa. Ervebo demonstrated 97.5% efficacy in clinical trials and has been instrumental in containing recent outbreaks through ring vaccination strategies.",
  },
  {
    name: "RSV",
    aliases: ["rsv", "respiratory syncytial virus", "arexvy", "abrysvo", "rsv vaccine"],
    synopsis:
      "A protein-based vaccine (Arexvy or Abrysvo) approved for adults 60 and older, and Abrysvo for pregnant individuals at 32-36 weeks gestation to protect newborns through maternal antibody transfer.",
    protectsAgainst:
      "Respiratory syncytial virus (RSV), which causes lower respiratory tract infections including bronchiolitis and pneumonia, particularly dangerous for older adults and infants.",
    value:
      "RSV causes approximately 60,000-120,000 hospitalizations and 6,000-10,000 deaths among US adults 65 and older each year. Maternal vaccination provides critical protection to newborns during their most vulnerable months.",
  },
  {
    name: "Mpox (Monkeypox)",
    aliases: ["mpox", "monkeypox", "jynneos", "imvamune", "imvanex", "mpox vaccine", "monkeypox vaccine"],
    synopsis:
      "A non-replicating modified vaccinia Ankara vaccine (JYNNEOS) given as a two-dose series. Approved for adults at high risk of mpox infection.",
    protectsAgainst:
      "Mpox (formerly monkeypox), an orthopoxvirus infection causing fever, rash with fluid-filled lesions, lymphadenopathy, and potentially serious complications.",
    value:
      "The 2022-2023 global mpox outbreak underscored the importance of orthopoxvirus vaccination. JYNNEOS provides approximately 86% efficacy after two doses and is a critical tool for outbreak control.",
  },
  {
    name: "Zika (Experimental)",
    aliases: ["zika", "zika vaccine", "zika virus vaccine"],
    synopsis:
      "Multiple Zika vaccine candidates are in various stages of clinical development, including DNA, mRNA, inactivated, and live attenuated platforms. No vaccine is currently licensed for general use.",
    protectsAgainst:
      "Zika virus infection, a mosquito-borne flavivirus that can cause birth defects (microcephaly and other congenital abnormalities) when contracted during pregnancy, and Guillain-Barre syndrome.",
    value:
      "The 2015-2016 Zika epidemic caused thousands of cases of microcephaly in newborns. A vaccine is urgently needed to protect pregnant individuals and their unborn children in endemic and epidemic regions.",
  },
  {
    name: "Malaria (RTS,S)",
    aliases: ["malaria", "rts,s", "rtss", "mosquirix", "malaria vaccine", "r21/matrix-m"],
    synopsis:
      "RTS,S/AS01 (Mosquirix) was the first malaria vaccine recommended by WHO in 2021, followed by R21/Matrix-M in 2023. Both target the Plasmodium falciparum parasite's circumsporozoite protein.",
    protectsAgainst:
      "Plasmodium falciparum malaria, the deadliest form of malaria, which causes fever, anemia, cerebral malaria, and approximately 600,000 deaths annually, primarily in young African children.",
    value:
      "Malaria kills a child roughly every minute. RTS,S reduces severe malaria by about 30% and R21/Matrix-M by up to 75% in clinical trials. These vaccines represent a historic milestone in the fight against one of humanity's oldest diseases.",
  },
  {
    name: "Pneumococcal Conjugate (PCV)",
    aliases: ["pcv13", "pcv15", "pcv20", "prevnar", "prevnar 13", "prevnar 20", "vaxneuvance", "pneumococcal conjugate"],
    synopsis:
      "Conjugate vaccines (PCV13, PCV15, PCV20) that stimulate stronger and longer-lasting immunity than polysaccharide vaccines, including in young children. Part of the routine childhood schedule and recommended for certain adults.",
    protectsAgainst:
      "Invasive pneumococcal disease (meningitis, bacteremia), pneumococcal pneumonia, and otitis media (ear infections) caused by the serotypes covered in each formulation.",
    value:
      "PCV introduction in children reduced invasive pneumococcal disease by over 90% in vaccinated age groups and provided indirect protection to unvaccinated adults through herd immunity. PCV20 simplifies the adult schedule by replacing the previous PCV13 + PPSV23 regimen.",
  },
];

/**
 * Look up vaccine info by name.
 * Performs case-insensitive matching against both the canonical name and aliases.
 */
export function findVaccineInfo(vaccineName: string): VaccineInfo | null {
  const lower = vaccineName.toLowerCase();
  return (
    VACCINE_DATA.find(
      (v) =>
        v.name.toLowerCase() === lower ||
        v.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))
    ) ?? null
  );
}

export default VACCINE_DATA;
