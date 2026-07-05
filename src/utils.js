export const formaterLieu = (lieu) => {
  return {
    nom: lieu.nom || "Nom inconnu",
    adresse: lieu.adresse || "Adresse inconnue",
    commune: lieu.commune || "Commune inconnue",
    typologie: lieu.typologie || "Typologie inconnue",
    typeInnovation: lieu.type_innovation || "Type d'innovation inconnu",
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

  return [...new Set(communes)].sort()
}