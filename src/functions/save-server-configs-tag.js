import { client, gql } from "./apollo-client"
import randomCharacters from "./random-characters"

const saveServerConfigsTag = async (obj, token) => {
  if (obj !== null && obj._id !== undefined) {
    try {
      await client(token).mutate({
        mutation: gql`
          mutation UpdateServerConfig {
            updateServerConfig(input: {
              where: {
                id: "${obj._id}"
              }
              data: {
                description: "${randomCharacters(8)}"
              }
            }) {
              serverConfig {
                _id
              }
            }
          }
        `,
      })
    } catch (error) {
      console.log({
        function: `saveServerConfigsTag()`,
        message: error.message,
      })
    }
  }
}

export default saveServerConfigsTag
