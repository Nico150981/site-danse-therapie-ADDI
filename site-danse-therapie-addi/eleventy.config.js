const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Empêche Eleventy de transformer README.md en page /readme/.
  eleventyConfig.ignores.add("README.md");

  // --- Fichiers statiques copiés tels quels ------------------------------
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

  eleventyConfig.addFilter("jsonStr", (value) => JSON.stringify(value == null ? "" : String(value)));

  // --- Image responsive (WebP + JPEG, plusieurs largeurs, lazy-loading) --
  // Cette version ne casse JAMAIS tout le site pour une seule image en
  // souci : chemin oublié, fichier pas encore ajouté, nom avec espace ou
  // accent... Elle affiche juste un espace réservé et écrit un
  // avertissement dans le journal de build, plutôt que de faire échouer
  // tout le déploiement.
  eleventyConfig.addAsyncShortcode("image", async function (src, alt, sizes = "100vw", className = "") {
    const texteAlt = alt || "";
    if (!src) return "";

    let srcRelatif = src.replace(/^\//, "./");
    if (!srcRelatif.includes("/")) {
      srcRelatif = `./images/${srcRelatif}`;
    }

    try {
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
      return Image.generateHTML(metadata, {
        alt: texteAlt,
        sizes,
        class: className,
        loading: "lazy",
        decoding: "async",
      });
    } catch (err) {
      console.warn(`[image] Fichier introuvable ou illisible : "${src}" (${err.message}). ` +
        `Vérifiez qu'il est bien dans le dossier images/ et que le chemin dans la Google Sheet est correct. ` +
        `Le site continue de se construire sans cette image.`);
      return "";
    }
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
