const { DateTime } = require("luxon");
const fs = require('fs');
const navigationPlugin = require('@11ty/eleventy-navigation')
const rssPlugin = require('@11ty/eleventy-plugin-rss')

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(navigationPlugin);
  eleventyConfig.addPlugin(rssPlugin);

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addFilter("filterTagList", filterTagList)

  eleventyConfig.addCollection("tagList", collection => {
    const tagsObject = {}
    collection.getAll().forEach(item => {
      if (!item.data.tags) return;
      item.data.tags
        .filter(tag => !['post', 'all'].includes(tag))
        .forEach(tag => {
          if(typeof tagsObject[tag] === 'undefined') {
            tagsObject[tag] = 1
          } else {
            tagsObject[tag] += 1
          }
        });
    });

    const tagList = []
    Object.keys(tagsObject).forEach(tag => {
      tagList.push({ tagName: tag, tagCount: tagsObject[tag] })
    })
    return tagList.sort((a, b) => b.tagCount - a.tagCount)
  });

  // Add featured posts collection
  eleventyConfig.addCollection("featuredPosts", collection => {
    return collection.getFilteredByTag("post")
      .filter(post => post.data.featured === true)
      .sort((a, b) => b.date - a.date);
  });

  // Add getFeaturedPost filter
  eleventyConfig.addFilter("getFeaturedPost", function(posts) {
    return posts.find(post => post.data.featured === true);
  });

  // Add watch target
  eleventyConfig.addWatchTarget("./src/scss/");
  
  // Browser Sync Config
  eleventyConfig.setBrowserSyncConfig({
    reloadDelay: 400
  });

  // Date filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {
      zone: 'utc'
    }).toFormat("dd LLL yyyy");
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: 'utc'
    }).toFormat('yyyy-LL-dd');
  });

  // Add Passthrough Copy - FIXED: Copy from dev/ where gulp processes files
  eleventyConfig.addPassthroughCopy({"dev/css": "css"});
  eleventyConfig.addPassthroughCopy({"dev/js": "js"});
  eleventyConfig.addPassthroughCopy({"dev/fonts": "fonts"});
  eleventyConfig.addPassthroughCopy({"dev/img": "img"});
  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});

  // Add TinaCMS admin route - IMPORTANT: This must come AFTER eleventy build
  eleventyConfig.addPassthroughCopy("admin");

  // Ignore TinaCMS files during build
  eleventyConfig.ignores.add(".tina/**");

  // Get path prefix from environment
  const pathPrefix = "/";
  
  // Return configuration object at the END
  return {
    pathPrefix: pathPrefix,
    dir: {
      input: "src",
      output: "public",
      includes: "_includes"
    },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};