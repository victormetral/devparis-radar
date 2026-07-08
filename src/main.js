import './style.css'

import {
  formaterLieu,
  filtrerParRecherche,
  filtrerParCommune,
  filtrerParEtat,
  getCommunesUniques,
  getEtatsUniques,
} from './utils.js'

const API_URL =
  'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arc_innovation/records?limit=20'

const placesContainer = document.querySelector('#places-container')
const counter = document.querySelector('#counter')
const searchInput = document.querySelector('#search-input')
const communeSelect = document.querySelector('#commune-select')
const etatSelect = document.querySelector('#etat-select')
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

const remplirSelectEtats = (lieux) => {
  const etats = getEtatsUniques(lieux)

  etats.forEach((etat) => {
    const option = document.createElement('option')

    option.value = etat
    option.textContent = etat

    etatSelect.appendChild(option)
  })
}

const creerParagraphe = (label, valeur) => {
  const paragraph = document.createElement('p')

  const strong = document.createElement('strong')
  strong.textContent = `${label} : `

  paragraph.appendChild(strong)
  paragraph.append(valeur)

  return paragraph
}

const creerLien = (texte, href, classeSupplementaire = '') => {
  const link = document.createElement('a')

  link.textContent = texte
  link.href = href
  link.classList.add('place-card__link')

  if (classeSupplementaire !== '') {
    link.classList.add(classeSupplementaire)
  }

  return link
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

  const title = document.createElement('h3')
  title.textContent = lieu.nom

  const status = document.createElement('p')
  status.classList.add('place-card__status')
  status.textContent = lieu.etat

  const adresse = creerParagraphe('Adresse', lieu.adresse)
  const commune = creerParagraphe('Commune', lieu.commune)
  const typologie = creerParagraphe('Typologie', lieu.typologie)
  const innovation = creerParagraphe('Innovation', lieu.typeInnovation)

  const description = document.createElement('p')
  description.classList.add('place-card__description')
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
  const siteLink = creerLien('Voir le site', lieu.siteInternet)

  siteLink.target = '_blank'
  siteLink.rel = 'noreferrer'

  card.appendChild(siteLink)
}

if (lieu.email) {
  const emailLink = creerLien(
    'Email',
    `mailto:${lieu.email}`,
    'place-card__link--secondary'
  )

  card.appendChild(emailLink)
}

if (lieu.telephone) {
  const telephoneLink = creerLien(
    'Téléphone',
    `tel:${lieu.telephone}`,
    'place-card__link--secondary'
  )

  card.appendChild(telephoneLink)
}

  placesContainer.appendChild(card)
})

  counter.textContent = lieux.length
}

const appliquerFiltres = () => {
  const recherche = searchInput.value
  const commune = communeSelect.value
  const etat = etatSelect.value

  let lieuxFiltres = filtrerParRecherche(tousLesLieux, recherche)
  lieuxFiltres = filtrerParCommune(lieuxFiltres, commune)
  lieuxFiltres = filtrerParEtat(lieuxFiltres, etat)

  afficherLieux(lieuxFiltres)
}

const chargerLieux = async () => {
  const response = await fetch(API_URL)
  const data = await response.json()

  tousLesLieux = data.results.map((lieu) => formaterLieu(lieu))

remplirSelectCommunes(tousLesLieux)
remplirSelectEtats(tousLesLieux)
afficherLieux(tousLesLieux)
}

searchInput.addEventListener('input', appliquerFiltres)
communeSelect.addEventListener('change', appliquerFiltres)
etatSelect.addEventListener('change', appliquerFiltres)

chargerLieux()