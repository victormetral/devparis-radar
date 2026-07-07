import { describe, expect, it } from "vitest"
import {
  formaterLieu,
  filtrerParRecherche,
  filtrerParCommune,
  getCommunesUniques,
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
    }

    const resultat = formaterLieu(lieuApi)

    expect(resultat).toEqual({
      nom: "Station F",
      adresse: "5 Parvis Alan Turing",
      commune: "Paris",
      typologie: "Incubateur",
      typeInnovation: "Innovation tech",
      etat: "existant",
    })
  })

  it("met des valeurs par défaut si des champs sont absents", () => {
    const lieuApi = {}

    const resultat = formaterLieu(lieuApi)

    expect(resultat).toEqual({
      nom: "Nom inconnu",
      adresse: "Adresse inconnue",
      commune: "Commune inconnue",
      typologie: "Typologie inconnue",
      typeInnovation: "Type d'innovation inconnu",
      etat: "État inconnu",
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