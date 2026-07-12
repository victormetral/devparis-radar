/* ===========================
   Formatage des données API
   =========================== */

export const formaterLieu = (lieu) => {
  const latitude = lieu.xy?.lat
  const longitude = lieu.xy?.lon
  /* Récupère les coordonnées si elles existent, sans faire planter le code. */

  return {
    id: `${lieu.nom || "lieu-inconnu"}-${lieu.adresse || "adresse-inconnue"}`,
    /* Crée un identifiant unique avec le nom et l'adresse du lieu. */

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
    /* Ajoute des valeurs par défaut si l'API ne fournit pas certaines données. */

    coordonnees:
      typeof latitude === "number" && typeof longitude === "number"
        ? { latitude, longitude }
        : null,
    /* Garde les coordonnées uniquement si latitude et longitude sont des nombres. */
  }
}

/* ===========================
   Filtre qualité des lieux
   =========================== */

export const filtrerLieuxExploitables = (lieux) => {
  return lieux.filter((lieu) => {
    const aCoordonnees = lieu.coordonnees !== null
    const aNom = lieu.nom !== "Nom inconnu"
    const aCommune = lieu.commune !== "Commune inconnue"

    const aDescriptionUtile =
      lieu.description !== "Description non disponible" &&
      lieu.description.length >= 80

    const aLienOuContact =
      lieu.siteInternet !== "" || lieu.email !== "" || lieu.telephone !== ""

    const aInnovationConnue =
      lieu.typeInnovation !== "Type d'innovation inconnu"

    return (
      aCoordonnees &&
      aNom &&
      aCommune &&
      (aDescriptionUtile || (aLienOuContact && aInnovationConnue))
    )
  })
}
/* Supprime les lieux trop vides pour garder des cartes réellement exploitables. */

/* ===========================
   Recherche texte
   =========================== */

const texteContient = (valeur, recherche) => {
  return String(valeur).toLowerCase().includes(recherche)
}
/* Convertit une valeur en texte puis vérifie si elle contient la recherche. */

export const filtrerParRecherche = (lieux, recherche) => {
  const rechercheMinuscule = recherche.trim().toLowerCase()
  /* Nettoie la recherche et ignore les majuscules. */

  if (rechercheMinuscule === "") {
    return lieux
  }
  /* Si la recherche est vide, on garde tous les lieux. */

  return lieux.filter((lieu) => {
    return (
      texteContient(lieu.nom, rechercheMinuscule) ||
      texteContient(lieu.adresse, rechercheMinuscule) ||
      texteContient(lieu.commune, rechercheMinuscule) ||
      texteContient(lieu.etat, rechercheMinuscule) ||
      texteContient(lieu.typologie, rechercheMinuscule) ||
      texteContient(lieu.typeInnovation, rechercheMinuscule) ||
      texteContient(lieu.description, rechercheMinuscule)
    )
  })
}
/* Cherche le texte dans plusieurs champs du lieu. */

/* ===========================
   Filtres utilisateur
   =========================== */

export const filtrerParCommune = (lieux, commune) => {
  if (commune === "Toutes") {
    return lieux
  }

  return lieux.filter((lieu) => lieu.commune === commune)
}
/* Garde uniquement les lieux de la commune sélectionnée. */

export const filtrerParEtat = (lieux, etat) => {
  if (etat === "Tous") {
    return lieux
  }

  return lieux.filter((lieu) => lieu.etat === etat)
}
/* Garde uniquement les lieux avec l'état sélectionné. */

/* ===========================
   Listes uniques pour les selects
   =========================== */

export const getCommunesUniques = (lieux) => {
  const communes = lieux.map((lieu) => lieu.commune)
  /* Transforme la liste des lieux en liste de communes. */

  return [...new Set(communes)].sort()
  /* Set supprime les doublons, sort() trie de A à Z. */
}

export const getEtatsUniques = (lieux) => {
  const etats = lieux.map((lieu) => lieu.etat)
  /* Transforme la liste des lieux en liste d'états. */

  return [...new Set(etats)].sort()
  /* Set supprime les doublons, sort() trie de A à Z. */
}

/* ===========================
   Mots-clés pour garder les lieux tech
   =========================== */

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
  "tiers-lieu",
  "tiers-lieux",
]
/* Mots-clés qui indiquent qu'un lieu peut être intéressant pour la tech. */

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
/* Mots-clés qui indiquent qu'un lieu est probablement hors sujet. */

/* ===========================
   Préparation du texte à analyser
   =========================== */

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
/* Regroupe plusieurs champs d'un lieu dans un seul texte en minuscules. */

const contientMotCle = (texte, motsCles) => {
  return motsCles.some((motCle) => texte.includes(motCle))
}
/* Vérifie si au moins un mot-clé est présent dans le texte. */

/* ===========================
   Filtre final des lieux tech
   =========================== */

export const filtrerLieuxTech = (lieux) => {
  return lieux.filter((lieu) => {
    const texte = creerTexteRecherche(lieu)

    const estTech = contientMotCle(texte, motsClesTech)
    const estHorsSujet = contientMotCle(texte, motsClesHorsSujet)

    return estTech && !estHorsSujet
  })
}
/* Garde les lieux tech et retire les lieux hors sujet. */