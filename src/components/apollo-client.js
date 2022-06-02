import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

const client = ( token ) => new ApolloClient({
  uri: `${process.env.GEPDX_API_URL}/graphql`,
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${token}`
  }
})

export {
  client,
  gql
}
