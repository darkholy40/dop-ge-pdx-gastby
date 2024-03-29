module.exports = {
  pathPrefix: `/app`,
  siteMetadata: {
    title: "GE-PDX",
    description: "GE-PDX",
    author: "Apirak Suwanyotee",
  },
  plugins: [
    "gatsby-plugin-styled-components",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Sarabun\:400,600`],
        display: `swap`,
      },
    },
  ],
}
