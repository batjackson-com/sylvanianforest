export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // Nunjucks for templates + markdown; HTML files also run through Nunjucks.
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
