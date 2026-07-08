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

/* Configuration des icônes Leaflet avec Vite */

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

/* Constantes */

const API_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arc_innovation/records?limit=100"

/* Sélecteurs DOM */

const placesContainer = document.querySelector("#places-container")
const counter = document.querySelector("#counter")
const searchInput = document.querySelector("#search-input")
const communeSelect = document.querySelector("#commune-select")
const etatSelect = document.querySelector("#etat-select")
const mapElement = document.querySelector("#map")

/* État global */

let tousLesLieux = []
let map = null
let markerLayer = null
let markersByLieu = new Map()

/* Sécurité affichage HTML dans les popups Leaflet */

const escapeHtml = (value) => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

/* Remplissage des filtres */

const remplirSelect = (select, valeurs) => {
  valeurs.forEach((valeur) => {
    const option = document.createElement("option")

    option.value = valeur
    option.textContent = valeur

    select.appendChild(option)
  })
}

const remplirFiltres = (lieux) => {
  const communes = getCommunesUniques(lieux)
  const etats = getEtatsUniques(lieux)

  remplirSelect(communeSelect, communes)
  remplirSelect(etatSelect, etats)
}

/* Création des éléments HTML */

const creerParagraphe = (label, valeur) => {
  const paragraph = document.createElement("p")

  const strong = document.createElement("strong")
  strong.textContent = `${label} : `

  paragraph.appendChild(strong)
  paragraph.append(valeur)

  return paragraph
}

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

/* Carte Leaflet */

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

const centrerCarteSurLieu = (lieu) => {
  if (!lieu.coordonnees || !map) {
    return
  }

  const { latitude, longitude } = lieu.coordonnees
  const marker = markersByLieu.get(lieu.id)

  map.setView([latitude, longitude], 15)

  if (marker) {
    marker.openPopup()
  }

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

/* Affichage des cartes */

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

  counter.textContent = lieux.length
}

/* Filtres */

const appliquerFiltres = () => {
  const recherche = searchInput.value
  const commune = communeSelect.value
  const etat = etatSelect.value

  let lieuxFiltres = filtrerParRecherche(tousLesLieux, recherche)
  lieuxFiltres = filtrerParCommune(lieuxFiltres, commune)
  lieuxFiltres = filtrerParEtat(lieuxFiltres, etat)

  afficherLieux(lieuxFiltres)
  afficherMarqueurs(lieuxFiltres)
}

/* Chargement API */

const chargerLieux = async () => {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()

    const lieuxFormates = data.results.map((lieu) => formaterLieu(lieu))

    tousLesLieux = filtrerLieuxTech(lieuxFormates)

    remplirFiltres(tousLesLieux)
    afficherLieux(tousLesLieux)
    afficherMarqueurs(tousLesLieux)
  } catch (error) {
    placesContainer.innerHTML =
      '<p class="empty-message">Impossible de charger les lieux pour le moment.</p>'

    counter.textContent = 0
    console.error(error)
  }
}

/* Événements */

searchInput.addEventListener("input", appliquerFiltres)
communeSelect.addEventListener("change", appliquerFiltres)
etatSelect.addEventListener("change", appliquerFiltres)

/* Initialisation */

initialiserCarte()
chargerLieux()