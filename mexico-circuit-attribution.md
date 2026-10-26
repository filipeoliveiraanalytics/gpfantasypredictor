# Mexico circuit asset

`Mexico.png` and `Mexico.svg` are adapted from **Autodromo Hermanos Rodriguez
2015.svg** by **Pitlane02**, Wikimedia Commons:
https://commons.wikimedia.org/wiki/File:Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez_2015.svg

License: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
The adapted assets retain this license. Credit the author, link to the source
and license, and note the modifications in dashboard credits when publishing.

Changes: retained the 2015-present main F1 circuit path, removed the oval, pit
lane and annotations, changed the stroke to dashboard grey, and adjusted framing.
The 1600 x 1200 PNG background is transparent. `Mexico-preview.png` is a separate
dark-background preview, not the asset intended for insertion.

Regenerate with `python Circuits/create_mexico_assets.py`.
The PBIX has not been modified. `gp_assets.csv` already references `Mexico.png`;
an Image URL visual requires uploading the PNG to the configured `f1-circuits`
hosting directory. A local Power BI image visual can use `Circuits/Mexico.png`.
