# Scores Tarot Gino

Application statique compatible GitHub Pages et installable en PWA.

## Publier sur GitHub Pages

1. Cree un depot GitHub vide.
2. Ajoute les fichiers de ce dossier dans le depot.
3. Envoie-les sur la branche principale.
4. Dans GitHub : Settings > Pages.
5. Dans Build and deployment : choisis Deploy from a branch.
6. Selectionne la branche principale et le dossier /(root).
7. Attends l'URL publiee par GitHub Pages.

## Installer sur iPhone

1. Ouvre l'URL GitHub Pages dans Safari.
2. Laisse la page se charger une premiere fois en ligne.
3. Utilise Partager > Sur l'ecran d'accueil.
4. Lance ensuite l'app depuis l'icone.

## Mode hors ligne

La PWA met en cache les fichiers statiques pour continuer a fonctionner hors ligne apres une premiere ouverture en ligne.
Une fois la version la plus recente chargee, l'ouverture de l'app privilegie le cache local et ne depend plus d'un acces reseau pour afficher l'interface.

Important : le service worker doit precacher uniquement des fichiers sous le meme sous-dossier que l'application. Si l'app est hebergee via GitHub Pages sur une URL de type /nom-du-depot/, un precache vers /index.html ou /styles.css casse l'installation hors ligne sur iPhone.

## Mise a jour de l'app installee

1. Ouvre l'app une fois avec une connexion internet apres publication d'une nouvelle version.
2. Ferme puis relance l'app.
3. Les lancements suivants peuvent se faire hors ligne avec les fichiers deja en cache.
4. Si une ancienne icone iPhone continue a ne pas demarrer hors ligne, ouvre d'abord l'URL dans Safari avec reseau pour laisser le nouveau service worker s'installer, puis relance l'app. En dernier recours, supprime l'icone de l'ecran d'accueil et ajoute-la de nouveau.

## Stockage des scores

Les donnees sont stockees localement dans le navigateur via localStorage.
Elles ne se synchronisent pas automatiquement entre plusieurs appareils.