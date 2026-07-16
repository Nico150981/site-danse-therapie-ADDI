module.exports = {
  nom: "Élan Créatif",
  accroche: "Danse-thérapie ADDI & médiation créative",
  description:
    "Un espace d'accompagnement par le mouvement et la création, à l'écoute du corps et de son langage propre.",
  url: process.env.URL || "https://votre-site.netlify.app",
  lang: "fr",
  ville: "",
  email: "contact@votre-domaine.fr",
  telephone: "",

  // --- Système de design -----------------------------------------------
  // Un seul endroit à modifier pour changer toute l'identité visuelle.
  // Les noms sont volontairement descriptifs (pas "couleur1", "couleur2")
  // pour qu'on sache ce que chaque teinte représente dans le projet.
  couleurs: {
    encre: "#2B2622", // texte principal, noir chaud
    ivoire: "#F6F1E7", // fond clair
    nuit: "#22252B", // fond sombre (hero, pied de page) - ancrage, gravité
    brique: "#A8462B", // accent principal (CTA, liens) - terre cuite profonde
    briqueSombre: "#7C331F", // état hover/focus de l'accent principal
    mousse: "#55624A", // accent secondaire - croissance, création
    ocre: "#C98A3E", // accent rare, réservé au tracé-signature (mouvement/énergie)
  },
  polices: {
    display: "Fraunces:opsz,wght@9..144,400;9..144,600",
    corps: "Karla:wght@400;500;700",
  },
  animations: true, // désactivez si vous préférez un site entièrement statique
};
