import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

const client = token => {
  let option = {}

  if (token !== undefined) {
    option = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  return new ApolloClient({
    uri: `${process.env.GEPDX_API_URL}/graphql`,
    cache: new InMemoryCache(),
    ...option,
  })
}

export { client, gql }
