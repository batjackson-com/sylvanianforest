import { slugify } from "./lib/slugify.js";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Shared slug helper, exposed to templates so a tag's link and its index
  // page permalink are generated the same way (see src/tag.njk, src/set.njk).
  eleventyConfig.addFilter("slugify", slugify);

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
