const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Empêche Eleventy de transformer README.md en page /readme/.
  // (Écrit ici plutôt que dans .eleventyignore : ce fichier caché est parfois
  // ignoré par l'upload "glisser-déposer" de l'interface web de GitHub.)
  eleventyConfig.ignores.add("README.md");

  // --- Fichiers statiques copiés tels quels ------------------------------
  // (css/style.njk n'est PAS copié ici : c'est un gabarit, voir plus bas)
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("humans.txt");

  // --- Filtres ------------------------------------------------------------
  eleventyConfig.addFilter("dateFr", (value) => {
    const d = value ? new Date(value) : new Date();
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  });

  eleventyConfig.addFilter("parJson", (value) => JSON.stringify(value));

  // Échappement correct d'une chaîne pour l'insérer comme valeur JSON
  // (utilisé dans les blocs JSON-LD, ex. les questions/réponses de la FAQ).
  eleventyConfig.addFilter("jsonStr", (value) => JSON.stringify(value == null ? "" : String(value)));

  // --- Image responsive (WebP + JPEG, plusieurs largeurs, lazy-loading) --
  // Usage dans un template : {% image "./images/portrait.jpg", "Texte alternatif" %}
  eleventyConfig.addAsyncShortcode("image", async function (src, alt, sizes = "100vw", className = "") {
    if (!alt && alt !== "") {
      throw new Error(`Attribut "alt" manquant pour l'image : ${src}. Chaque image doit avoir un texte alternatif (accessibilité).`);
    }
    // Dans la Google Sheet, les chemins sont saisis comme "/images/x.jpg"
    // (chemin web). Sur le disque, le fichier est à "./images/x.jpg".
    const srcRelatif = src.replace(/^\//, "./");
    let metadata = await Image(srcRelatif, {
      widths: [480, 800, 1200, 1600],
      formats: ["webp", "jpeg"],
      outputDir: "_site/images/optimisees/",
      urlPath: "/images/optimisees/",
      filenameFormat: function (id, src, width, format) {
        const name = require("path").basename(src, require("path").extname(src));
        return `${name}-${width}w.${format}`;
      },
    });
    let imageAttributes = {
      alt,
      sizes,
      class: className,
      loading: "lazy",
      decoding: "async",
    };
    return Image.generateHTML(metadata, imageAttributes);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
