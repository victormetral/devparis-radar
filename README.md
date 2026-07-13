# DevParis Radar

DevParis Radar est une application web permettant d’explorer des lieux liés à la technologie, à l’innovation, aux fablabs et au coworking autour de Paris.

Les données sont récupérées depuis l’API publique OpenData Paris puis affichées sous forme de cartes et sur une carte interactive.

🔗 [Voir le site en ligne](https://devparis-radar.netlify.app)

## Fonctionnalités

- Récupération des données avec `fetch` et `async/await`
- Affichage dynamique des lieux
- Recherche par nom, adresse, commune, typologie ou description
- Filtre par commune
- Filtre par état
- Filtres rapides par catégorie
- Pagination des résultats
- Affichage des lieux sur une carte interactive
- Liens vers les sites internet, emails et numéros de téléphone
- Message lorsqu’aucun résultat ne correspond
- Interface responsive
- Tests unitaires avec Vitest

## Technologies utilisées

- HTML
- CSS
- JavaScript
- Vite
- Vitest
- Leaflet
- OpenStreetMap
- API OpenData Paris

## Organisation du projet

```text
devparis-radar/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.js
    ├── utils.js
    ├── utils.test.js
    ├── reset.css
    └── style.css
```

`main.js` contient la récupération des données, les événements et la manipulation du DOM.

`utils.js` contient les fonctions de formatage et de filtrage des données.

`utils.test.js` contient les tests unitaires réalisés avec Vitest.

## Installation

Cloner le dépôt :

```bash
git clone https://github.com/victormetral/devparis-radar.git
```

Se déplacer dans le projet :

```bash
cd devparis-radar
```

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de développement :

```bash
npm run dev
```

## Lancer les tests

```bash
npm run test
```

## Source des données

Les données proviennent du jeu de données `arc_innovation` disponible sur OpenData Paris.

L’API est interrogée par paquets de 100 résultats afin de récupérer tous les lieux disponibles.

## Auteur

Projet réalisé par Victor Metral dans le cadre de la semaine 8 de la formation Ada Tech School.
