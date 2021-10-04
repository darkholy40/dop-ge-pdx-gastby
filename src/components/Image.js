import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

/*
 * Read more document
 * https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/
 */

const Image = ({ src, style, imgStyle }) => (
  <StaticQuery
    query={graphql`
      query ImageFiles {
        allFile(filter: { sourceInstanceName: { eq: "images" } }) {
          edges {
            node {
              childImageSharp {
                gatsbyImageData(layout: CONSTRAINED, placeholder: TRACED_SVG)
              }
              relativePath
              name
              publicURL
            }
          }
        }
      }
    `}
    render={data => {
      const image = data.allFile.edges.find(
        edge => edge.node.relativePath === src
      )

      return image ? (
        <GatsbyImage
          image={image.node.childImageSharp.gatsbyImageData}
          alt={image.node.name}
          style={{
            width: `100%`,
            height: `100%`,
            ...style,
          }}
          imgStyle={{
            objectFit: `contain`,
            ...imgStyle,
          }}
        />
      ) : (
        <span style={{ color: `grey`, backgroundColor: `white` }}>
          Image not found
        </span>
      )
    }}
  />
)

Image.propTypes = {
  src: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  imgStyle: PropTypes.objectOf(PropTypes.any),
}

Image.defaultProps = {
  src: ``,
  style: {},
  imgStyle: {},
}

export default Image
