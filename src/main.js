import './style.css'

import {
  formaterLieu,
  filtrerParRecherche,
  filtrerParCommune,
  getCommunesUniques,
} from './utils.js'

const API_URL =
  'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arc_innovation/records?limit=20'

const placesContainer = document.querySelector('#places-container')
const counter = document.querySelector('#counter')
const searchInput = document.querySelector('#search-input')
const communeSelect = document.querySelector('#commune-select')

let tousLesLieux = []

const remplirSelectCommunes = (lieux) => {
  const communes = getCommunesUniques(lieux)

  communes.forEach((commune) => {
    const option = document.createElement('option')

    option.value = commune
    option.textContent = commune

    communeSelect.appendChild(option)
  })
}

const afficherLieux = (lieux) => {
  placesContainer.innerHTML = ''

  if (lieux.length === 0) {
    placesContainer.innerHTML =
      '<p class="empty-message">Aucun lieu ne correspond à votre recherche.</p>'
    counter.textContent = 0
    return
  }

  lieux.forEach((lieu) => {
    const card = document.createElement('article')
    card.classList.add('place-card')

card.innerHTML = `
  <h3>${lieu.nom}</h3>
  <p><strong>Adresse :</strong> ${lieu.adresse}</p>
  <p><strong>Commune :</strong> ${lieu.commune}</p>
  <p><strong>Typologie :</strong> ${lieu.typologie}</p>
  <p><strong>Innovation :</strong> ${lieu.typeInnovation}</p>
`

    placesContainer.appendChild(card)
  })

  counter.textContent = lieux.length
}

const appliquerFiltres = () => {
  const recherche = searchInput.value
  const commune = communeSelect.value

  let lieuxFiltres = filtrerParRecherche(tousLesLieux, recherche)
  lieuxFiltres = filtrerParCommune(lieuxFiltres, commune)

  afficherLieux(lieuxFiltres)
}

const chargerLieux = async () => {
  const response = await fetch(API_URL)
  const data = await response.json()

  tousLesLieux = data.results.map((lieu) => formaterLieu(lieu))

  remplirSelectCommunes(tousLesLieux)
  afficherLieux(tousLesLieux)
}

searchInput.addEventListener('input', appliquerFiltres)
communeSelect.addEventListener('change', appliquerFiltres)

chargerLieux()