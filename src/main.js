// Imports
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

import "./reset.css"
import "./style.css"

import {
  formaterLieu,
  filtrerParRecherche,
  filtrerParCommune,
  filtrerParEtat,
  getCommunesUniques,
  getEtatsUniques,
  filtrerLieuxTech,
} from "./utils.js"

/* ===========================
   Configuration Leaflet avec Vite
   =========================== */

delete L.Icon.Default.prototype._getIconUrl
/* Désactive la recherche automatique des icônes Leaflet. */

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
/* Indique à Leaflet où trouver les images des marqueurs avec Vite. */

/* ===========================
   Constantes
   =========================== */

const API_BASE_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arc_innovation/records"
/* URL de base de l'API OpenData Paris. */

/* ===========================
   Sélecteurs DOM
   =========================== */

const placesContainer = document.querySelector("#places-container")
const counter = document.querySelector("#counter")
const searchInput = document.querySelector("#search-input")
const clearSearchButton = document.querySelector("#clear-search")
const communeSelect = document.querySelector("#commune-select")
const etatSelect = document.querySelector("#etat-select")
const resetFiltersButton = document.querySelector("#reset-filters")

const categoryFilters = document.querySelector(".category-filters")

const mapElement = document.querySelector("#map")
const mapPanel = document.querySelector(".map-panel")

const previousPageButton = document.querySelector("#previous-page")
const nextPageButton = document.querySelector("#next-page")
const paginationPages = document.querySelector("#pagination-pages")
const pagination = document.querySelector(".pagination")
/* Récupère les éléments HTML utilisés par JavaScript. */

/* ===========================
   État global
   =========================== */

let tousLesLieux = []
let lieuxFiltresCourants = []
let pageActuelle = 1
const lieuxParPage = 12

let categorieActive = "Tous"

let map = null
let markerLayer = null
let markersByLieu = new Map()
/* Stocke les données, la pagination, la catégorie active et les éléments Leaflet. */

/* ===========================
   Sécurité HTML
   =========================== */

const escapeHtml = (value) => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
/* Évite d'injecter du HTML dangereux dans les popups Leaflet. */

/* ===========================
   Remplissage des filtres select
   =========================== */

const remplirSelect = (select, valeurs) => {
  valeurs.forEach((valeur) => {
    const option = document.createElement("option")

    option.value = valeur
    option.textContent = valeur

    select.appendChild(option)
  })
}
/* Ajoute dynamiquement des options dans un select. */

const remplirFiltres = (lieux) => {
  const communes = getCommunesUniques(lieux)
  const etats = getEtatsUniques(lieux)

  remplirSelect(communeSelect, communes)
  remplirSelect(etatSelect, etats)
}
/* Remplit les filtres commune et état à partir des données. */

/* ===========================
   Catégories lisibles pour l'utilisateur
   =========================== */

const categories = [
  {
    label: "Tous",
    motsCles: [],
  },
  {
    label: "Fablab",
    motsCles: ["fablab", "fabrication", "atelier", "maker", "prototype"],
  },
  {
    label: "Coworking",
    motsCles: ["coworking", "tiers-lieu", "espace partagé"],
  },
  {
    label: "Incubateur",
    motsCles: ["incubateur", "startup", "start-up", "entrepreneur"],
  },
  {
    label: "Numérique",
    motsCles: ["numérique", "digital", "tech", "logiciel", "open source"],
  },
  {
    label: "Data",
    motsCles: ["data", "donnée", "données"],
  },
  {
    label: "Robotique",
    motsCles: ["robotique", "prototype", "industrie"],
  },
]
/* Définit des catégories plus compréhensibles que les typologies brutes de l'API. */

const afficherCategories = () => {
  categoryFilters.innerHTML = ""

  categories.forEach((categorie) => {
    const button = document.createElement("button")

    button.type = "button"
    button.textContent = categorie.label
    button.classList.add("category-button")

    if (categorie.label === categorieActive) {
      button.classList.add("is-active")
    }

    button.addEventListener("click", () => {
      categorieActive = categorie.label
      pageActuelle = 1
      appliquerFiltres()
    })

    categoryFilters.appendChild(button)
  })
}
/* Crée les boutons de catégories et active le bon bouton au clic. */

const filtrerParCategorie = (lieux, categorieActive) => {
  if (categorieActive === "Tous") {
    return lieux
  }

  const categorie = categories.find((item) => item.label === categorieActive)

  if (!categorie) {
    return lieux
  }

  return lieux.filter((lieu) => {
    const texte = [
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

    return categorie.motsCles.some((motCle) => texte.includes(motCle))
  })
}
/* Filtre les lieux selon les mots-clés de la catégorie active. */

/* ===========================
   Création d'éléments HTML
   =========================== */

const creerParagraphe = (label, valeur) => {
  const paragraph = document.createElement("p")

  const strong = document.createElement("strong")
  strong.textContent = `${label} : `

  paragraph.appendChild(strong)
  paragraph.append(valeur)

  return paragraph
}
/* Crée une ligne de texte avec un label en gras. */

const creerLien = (texte, href, classeSupplementaire = "") => {
  const link = document.createElement("a")

  link.textContent = texte
  link.href = href
  link.classList.add("place-card__link")

  if (classeSupplementaire !== "") {
    link.classList.add(classeSupplementaire)
  }

  return link
}
/* Crée un lien réutilisable pour site, email ou téléphone. */

/* ===========================
   Carte Leaflet
   =========================== */

const initialiserCarte = () => {
  if (!mapElement) {
    return
  }

  map = L.map(mapElement).setView([48.8566, 2.3522], 12)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map)

  markerLayer = L.layerGroup().addTo(map)
}
/* Initialise la carte centrée sur Paris. */

const centrerCarteSurLieu = (lieu) => {
  if (!lieu.coordonnees || !map) {
    return
  }

  const { latitude, longitude } = lieu.coordonnees
  const marker = markersByLieu.get(lieu.id)

  if (mapPanel) {
    mapPanel.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  setTimeout(() => {
    map.setView([latitude, longitude], 15)

    if (marker) {
      marker.openPopup()
    }
  }, 400)

  document.querySelectorAll(".place-card").forEach((card) => {
    card.classList.remove("is-active")
  })

  const activeCard = document.querySelector(
    `[data-lieu-id="${CSS.escape(lieu.id)}"]`
  )

  if (activeCard) {
    activeCard.classList.add("is-active")
  }
}
/* Centre la carte sur un lieu et met sa carte HTML en évidence. */

const afficherMarqueurs = (lieux) => {
  if (!map || !markerLayer) {
    return
  }

  markerLayer.clearLayers()
  markersByLieu = new Map()

  const bounds = []

  lieux.forEach((lieu) => {
    if (!lieu.coordonnees) {
      return
    }

    const { latitude, longitude } = lieu.coordonnees

    const marker = L.marker([latitude, longitude])

    marker
      .addTo(markerLayer)
      .bindPopup(`
        <strong>${escapeHtml(lieu.nom)}</strong><br>
        ${escapeHtml(lieu.commune)}<br>
        ${escapeHtml(lieu.etat)}
      `)

    markersByLieu.set(lieu.id, marker)
    bounds.push([latitude, longitude])
  })

  if (bounds.length > 0) {
    map.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: 13,
    })
  }
}
/* Affiche les marqueurs correspondant aux lieux filtrés. */

/* ===========================
   Affichage des cartes
   =========================== */

const creerCarteLieu = (lieu) => {
  const card = document.createElement("article")
  card.classList.add("place-card")
  card.dataset.lieuId = lieu.id

  const title = document.createElement("h3")
  title.textContent = lieu.nom

  const status = document.createElement("p")
  status.classList.add("place-card__status")
  status.textContent = lieu.etat

  const adresse = creerParagraphe("Adresse", lieu.adresse)
  const commune = creerParagraphe("Commune", lieu.commune)
  const typologie = creerParagraphe("Typologie", lieu.typologie)
  const innovation = creerParagraphe("Innovation", lieu.typeInnovation)

  const description = document.createElement("p")
  description.classList.add("place-card__description")
  description.textContent = lieu.description

  card.append(
    title,
    status,
    adresse,
    commune,
    typologie,
    innovation,
    description
  )

  if (lieu.siteInternet) {
    const siteLink = creerLien("Voir le site", lieu.siteInternet)

    siteLink.target = "_blank"
    siteLink.rel = "noreferrer"

    card.appendChild(siteLink)
  }

  if (lieu.email) {
    const emailLink = creerLien(
      "Email",
      `mailto:${lieu.email}`,
      "place-card__link--secondary"
    )

    card.appendChild(emailLink)
  }

  if (lieu.telephone) {
    const telephoneLink = creerLien(
      "Téléphone",
      `tel:${lieu.telephone}`,
      "place-card__link--secondary"
    )

    card.appendChild(telephoneLink)
  }

  if (lieu.coordonnees) {
    const mapButton = document.createElement("button")

    mapButton.type = "button"
    mapButton.classList.add("place-card__link")
    mapButton.textContent = "Voir sur la carte"

    mapButton.addEventListener("click", () => {
      centrerCarteSurLieu(lieu)
    })

    card.appendChild(mapButton)
  }

  return card
}
/* Crée une carte HTML complète pour un lieu. */

const afficherLieux = (lieux) => {
  placesContainer.innerHTML = ""

  if (lieux.length === 0) {
    const emptyMessage = document.createElement("p")
    emptyMessage.classList.add("empty-message")
    emptyMessage.textContent = "Aucun lieu ne correspond à votre recherche."

    placesContainer.appendChild(emptyMessage)
    counter.textContent = 0

    return
  }

  lieux.forEach((lieu) => {
    const card = creerCarteLieu(lieu)
    placesContainer.appendChild(card)
  })

  counter.textContent = lieuxFiltresCourants.length
}
/* Affiche les cartes de la page actuelle. */

/* ===========================
   Pagination numérotée
   =========================== */

const paginerLieux = (lieux) => {
  const debut = (pageActuelle - 1) * lieuxParPage
  const fin = debut + lieuxParPage

  return lieux.slice(debut, fin)
}
/* Découpe les résultats pour afficher seulement une page. */

const mettreAJourPagination = () => {
  const nombrePages = Math.ceil(lieuxFiltresCourants.length / lieuxParPage) || 1

  paginationPages.innerHTML = ""

  for (let numeroPage = 1; numeroPage <= nombrePages; numeroPage += 1) {
    const button = document.createElement("button")

    button.type = "button"
    button.textContent = numeroPage
    button.classList.add("pagination__page-button")

    if (numeroPage === pageActuelle) {
      button.classList.add("is-active")
    }

    button.addEventListener("click", () => {
      pageActuelle = numeroPage

      afficherLieux(paginerLieux(lieuxFiltresCourants))
      mettreAJourPagination()
      scrollVersPagination()
    })

    paginationPages.appendChild(button)
  }

  previousPageButton.disabled = pageActuelle === 1
  nextPageButton.disabled = pageActuelle >= nombrePages
}
/* Crée les boutons de pages et met à jour Précédent / Suivant. */

const scrollVersPagination = () => {
  if (!pagination) {
    return
  }

  pagination.scrollIntoView({
    behavior: "smooth",
    block: "center",
  })
}
/* Garde les boutons de pagination visibles après un changement de page. */

/* ===========================
   Filtres
   =========================== */

const resetFiltres = () => {
  searchInput.value = ""
  communeSelect.value = "Toutes"
  etatSelect.value = "Tous"
  categorieActive = "Tous"

  pageActuelle = 1

  appliquerFiltres()
}
/* Réinitialise tous les filtres et revient à la première page. */

const appliquerFiltres = () => {
  const recherche = searchInput.value
  const commune = communeSelect.value
  const etat = etatSelect.value

  let lieuxFiltres = filtrerParRecherche(tousLesLieux, recherche)
  lieuxFiltres = filtrerParCommune(lieuxFiltres, commune)
  lieuxFiltres = filtrerParCategorie(lieuxFiltres, categorieActive)
  lieuxFiltres = filtrerParEtat(lieuxFiltres, etat)

  lieuxFiltresCourants = lieuxFiltres
  pageActuelle = 1

  afficherCategories()

  const lieuxPaginees = paginerLieux(lieuxFiltresCourants)

  afficherLieux(lieuxPaginees)
  afficherMarqueurs(lieuxFiltresCourants)
  mettreAJourPagination()
}
/* Applique recherche, commune, catégorie et état, puis rafraîchit l'affichage. */

/* ===========================
   Chargement API
   =========================== */

const chargerTousLesResultats = async () => {
  const limit = 100
  let offset = 0
  let total = Infinity
  let resultats = []

  while (offset < total) {
    const response = await fetch(
      `${API_BASE_URL}?limit=${limit}&offset=${offset}`
    )

    const data = await response.json()

    resultats = [...resultats, ...data.results]
    total = data.total_count
    offset += limit
  }

  return resultats
}
/* Charge tous les résultats de l'API par paquets de 100. */

const chargerLieux = async () => {
  try {
    const resultatsApi = await chargerTousLesResultats()

    const lieuxFormates = resultatsApi.map((lieu) => formaterLieu(lieu))

    tousLesLieux = filtrerLieuxTech(lieuxFormates)

    remplirFiltres(tousLesLieux)
    afficherCategories()

    lieuxFiltresCourants = tousLesLieux

    afficherLieux(paginerLieux(lieuxFiltresCourants))
    afficherMarqueurs(lieuxFiltresCourants)
    mettreAJourPagination()
  } catch (error) {
    placesContainer.innerHTML =
      '<p class="empty-message">Impossible de charger les lieux pour le moment.</p>'

    counter.textContent = 0
    console.error(error)
  }
}
/* Charge les données, les formate, les filtre, puis initialise l'affichage. */

/* ===========================
   Événements
   =========================== */

searchInput.addEventListener("input", appliquerFiltres)
communeSelect.addEventListener("change", appliquerFiltres)
etatSelect.addEventListener("change", appliquerFiltres)
resetFiltersButton.addEventListener("click", resetFiltres)
/* Relance les filtres quand l'utilisateur interagit avec les champs. */

previousPageButton.addEventListener("click", () => {
  if (pageActuelle > 1) {
    pageActuelle -= 1

    afficherLieux(paginerLieux(lieuxFiltresCourants))
    mettreAJourPagination()
    scrollVersPagination()
  }
})
/* Affiche la page précédente. */

nextPageButton.addEventListener("click", () => {
  const nombrePages = Math.ceil(lieuxFiltresCourants.length / lieuxParPage) || 1

  if (pageActuelle < nombrePages) {
    pageActuelle += 1

    afficherLieux(paginerLieux(lieuxFiltresCourants))
    mettreAJourPagination()
    scrollVersPagination()
  }
})
/* Affiche la page suivante. */

clearSearchButton.addEventListener("click", () => {
  searchInput.value = ""
  pageActuelle = 1
  appliquerFiltres()
  searchInput.focus()
})
/* Vide la recherche et remet le focus dans le champ. */

/* ===========================
   Initialisation
   =========================== */

initialiserCarte()
chargerLieux()
/* Lance la carte puis charge les lieux. */