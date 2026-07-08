export const formaterLieu = (lieu) => {
  const latitude = lieu.xy?.lat
  const longitude = lieu.xy?.lon

  return {
    id: `${lieu.nom || "lieu-inconnu"}-${lieu.adresse || "adresse-inconnue"}`,
    nom: lieu.nom || "Nom inconnu",
    adresse: lieu.adresse || "Adresse inconnue",
    commune: lieu.commune || "Commune inconnue",
    etat: lieu.etat || "État inconnu",
    typologie: lieu.typologie || "Typologie inconnue",
    typeInnovation: lieu.type_innovation || "Type d'innovation inconnu",
    description: lieu.texte_descriptif || "Description non disponible",
    siteInternet: lieu.site_internet || "",
    email: lieu.contact_mail || "",
    telephone: lieu.contact_telephonique || "",
    coordonnees:
      typeof latitude === "number" && typeof longitude === "number"
        ? { latitude, longitude }
        : null,
  }
}

export const filtrerParRecherche = (lieux, recherche) => {
  const rechercheMinuscule = recherche.toLowerCase()

  return lieux.filter((lieu) => {
    return (
      lieu.nom.toLowerCase().includes(rechercheMinuscule) ||
      lieu.adresse.toLowerCase().includes(rechercheMinuscule) ||
      lieu.commune.toLowerCase().includes(rechercheMinuscule) ||
      lieu.typologie.toLowerCase().includes(rechercheMinuscule) ||
      lieu.typeInnovation.toLowerCase().includes(rechercheMinuscule)
    )
  })
}

export const filtrerParCommune = (lieux, commune) => {
  if (commune === "Toutes") {
    return lieux
  }

  return lieux.filter((lieu) => lieu.commune === commune)
}

export const getCommunesUniques = (lieux) => {
  const communes = lieux.map((lieu) => lieu.commune)

  return [...new Set(communes)].sort() // Supprime les doublons avec Set, puis trie les communes par ordre alphabétique
}

export const filtrerParEtat = (lieux, etat) => {
  if (etat === "Tous") {
    return lieux
  }

  return lieux.filter((lieu) => lieu.etat === etat)
}

export const getEtatsUniques = (lieux) => {
  const etats = lieux.map((lieu) => lieu.etat)

  return [...new Set(etats)].sort()
}

const motsClesTech = [
  "tech",
  "numérique",
  "digital",
  "startup",
  "start-up",
  "fablab",
  "incubateur",
  "coworking",
  "industrie",
  "industries",
  "maker",
  "makers",
  "fabrication",
  "atelier",
  "prototype",
  "prototypage",
  "data",
  "robotique",
  "logiciel",
  "open source",
  "innovation technologique",
]

const motsClesHorsSujet = [
  "agriculture",
  "agricole",
  "jardin",
  "jardinage",
  "potager",
  "végétal",
  "culture",
  "théâtre",
  "crèche",
  "résidence",
  "hôtel",
  "hôtellerie",
  "habiter",
  "logement",
  "supermarché",
  "alimentaire",
  "coopérative alimentaire",
]

const creerTexteRecherche = (lieu) => {
  return [
    lieu.nom,
    lieu.adresse,
    lieu.commune,
    lieu.etat,
    lieu.typologie,
    lieu.typeInnovation,
    lieu.description,
    lieu.siteInternet,
  ]
    .join(" ")
    .toLowerCase()
}

const contientMotCle = (texte, motsCles) => {
  return motsCles.some((motCle) => texte.includes(motCle))
}

export const filtrerLieuxTech = (lieux) => {
  return lieux.filter((lieu) => {
    const texte = creerTexteRecherche(lieu)

    const estTech = contientMotCle(texte, motsClesTech)
    const estHorsSujet = contientMotCle(texte, motsClesHorsSujet)

    return estTech && !estHorsSujet
  })
}