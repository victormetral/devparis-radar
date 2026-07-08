import { describe, expect, it } from "vitest"
import {
  formaterLieu,
  filtrerParRecherche,
  filtrerParCommune,
  getCommunesUniques,
  filtrerParEtat,
  getEtatsUniques,
  filtrerLieuxTech,
} from "./utils.js"

describe("formaterLieu", () => {
  it("transforme une donnée brute de l'API en objet propre", () => {
    const lieuApi = {
      nom: "Station F",
      adresse: "5 Parvis Alan Turing",
      commune: "Paris",
      typologie: "Incubateur",
      type_innovation: "Innovation tech",
      etat: "existant",
      texte_descriptif: "Grand lieu d’innovation à Paris",
      site_internet: "https://example.com",
      contact_mail: "contact@example.com",
      contact_telephonique: "0102030405",
      xy: {
        lat: 48.8566,
        lon: 2.3522,
      },
    }

    const resultat = formaterLieu(lieuApi)

    expect(resultat).toEqual({
      id: "Station F-5 Parvis Alan Turing",
      nom: "Station F",
      adresse: "5 Parvis Alan Turing",
      commune: "Paris",
      typologie: "Incubateur",
      typeInnovation: "Innovation tech",
      etat: "existant",
      description: "Grand lieu d’innovation à Paris",
      siteInternet: "https://example.com",
      email: "contact@example.com",
      telephone: "0102030405",
      coordonnees: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    })
  })

  it("met des valeurs par défaut si des champs sont absents", () => {
    const lieuApi = {}

    const resultat = formaterLieu(lieuApi)

    expect(resultat).toEqual({
      id: "lieu-inconnu-adresse-inconnue",
      nom: "Nom inconnu",
      adresse: "Adresse inconnue",
      commune: "Commune inconnue",
      typologie: "Typologie inconnue",
      typeInnovation: "Type d'innovation inconnu",
      etat: "État inconnu",
      description: "Description non disponible",
      siteInternet: "",
      email: "",
      telephone: "",
      coordonnees: null,
    })
  })
})

describe("filtrerParRecherche", () => {
  it("filtre les lieux selon le nom recherché", () => {
    const lieux = [
      {
        nom: "Station F",
        adresse: "5 Parvis Alan Turing",
        commune: "Paris",
        typologie: "Incubateur",
        typeInnovation: "Innovation tech",
      },
      {
        nom: "La Ruche",
        adresse: "24 rue de l'Est",
        commune: "Montreuil",
        typologie: "Coworking",
        typeInnovation: "Économie sociale",
      },
    ]

    const resultat = filtrerParRecherche(lieux, "station")

    expect(resultat).toEqual([
      {
        nom: "Station F",
        adresse: "5 Parvis Alan Turing",
        commune: "Paris",
        typologie: "Incubateur",
        typeInnovation: "Innovation tech",
      },
    ])
  })

  it("filtre sans tenir compte des majuscules", () => {
    const lieux = [
      {
        nom: "Station F",
        adresse: "5 Parvis Alan Turing",
        commune: "Paris",
        typologie: "Incubateur",
        typeInnovation: "Innovation tech",
      },
      {
        nom: "La Ruche",
        adresse: "24 rue de l'Est",
        commune: "Montreuil",
        typologie: "Coworking",
        typeInnovation: "Économie sociale",
      },
    ]

    const resultat = filtrerParRecherche(lieux, "STATION")

    expect(resultat.length).toBe(1)
    expect(resultat[0].nom).toBe("Station F")
  })
})

describe("filtrerParCommune", () => {
  it("filtre les lieux selon la commune", () => {
    const lieux = [
      {
        nom: "Station F",
        adresse: "5 Parvis Alan Turing",
        commune: "Paris",
        typologie: "Incubateur",
        typeInnovation: "Innovation tech",
      },
      {
        nom: "Lieu Tech",
        adresse: "10 rue test",
        commune: "Montreuil",
        typologie: "Coworking",
        typeInnovation: "Tech",
      },
    ]

    const resultat = filtrerParCommune(lieux, "Paris")

    expect(resultat).toEqual([
      {
        nom: "Station F",
        adresse: "5 Parvis Alan Turing",
        commune: "Paris",
        typologie: "Incubateur",
        typeInnovation: "Innovation tech",
      },
    ])
  })

  it("retourne tous les lieux si la commune vaut Toutes", () => {
    const lieux = [
      {
        nom: "Station F",
        adresse: "5 Parvis Alan Turing",
        commune: "Paris",
        typologie: "Incubateur",
        typeInnovation: "Innovation tech",
      },
      {
        nom: "Lieu Tech",
        adresse: "10 rue test",
        commune: "Montreuil",
        typologie: "Coworking",
        typeInnovation: "Tech",
      },
    ]

    const resultat = filtrerParCommune(lieux, "Toutes")

    expect(resultat).toEqual(lieux)
  })
})

describe("getCommunesUniques", () => {
  it("retourne une liste de communes sans doublons et triée", () => {
    const lieux = [
      { commune: "Paris" },
      { commune: "Montreuil" },
      { commune: "Paris" },
    ]

    const resultat = getCommunesUniques(lieux)

    expect(resultat).toEqual(["Montreuil", "Paris"])
  })
})

describe("filtrerParEtat", () => {
  it("filtre les lieux selon l'état", () => {
    const lieux = [
      { nom: "Lieu A", etat: "existant" },
      { nom: "Lieu B", etat: "projet" },
    ]

    const resultat = filtrerParEtat(lieux, "projet")

    expect(resultat).toEqual([{ nom: "Lieu B", etat: "projet" }])
  })

  it("retourne tous les lieux si l'état vaut Tous", () => {
    const lieux = [
      { nom: "Lieu A", etat: "existant" },
      { nom: "Lieu B", etat: "projet" },
    ]

    const resultat = filtrerParEtat(lieux, "Tous")

    expect(resultat).toEqual(lieux)
  })
})

describe("getEtatsUniques", () => {
  it("retourne une liste d'états sans doublons et triée", () => {
    const lieux = [
      { etat: "projet" },
      { etat: "existant" },
      { etat: "projet" },
    ]

    const resultat = getEtatsUniques(lieux)

    expect(resultat).toEqual(["existant", "projet"])
  })
})

describe("filtrerLieuxTech", () => {
  it("garde les lieux liés à la tech", () => {
    const lieux = [
      {
        nom: "Cotlisame",
        typologie: "Nouvelles économies et industries",
        typeInnovation: "Fablab",
        description: "",
      },
      {
        nom: "École de Bercy",
        typologie: "Nouveaux lieux - nouveaux services",
        typeInnovation: "Agriculture urbaine",
        description: "Toit terrasse végétalisé",
      },
    ]

    const resultat = filtrerLieuxTech(lieux)

    expect(resultat).toEqual([
      {
        nom: "Cotlisame",
        typologie: "Nouvelles économies et industries",
        typeInnovation: "Fablab",
        description: "",
      },
    ])
  })
})