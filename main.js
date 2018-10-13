import { ApolloServer, gql } from 'apollo-server';

import resolvers from './src/resolvers';
import dataSources from './src/data-sources';

const typeDefs = gql`
  type Query {
    "Get demarche by ID"
    demarche(id: ID!): Demarche
  }

  type Demarche {
    id: ID
    title: String
    description: String
    organisation: String
    state: DemarcheState
    link: String

    champs: [Champ]
    dossiers(id: ID, ids: [ID], state: DemarcheState): [Dossier]
  }

  type DemarcheDescription {
    id: ID
    title: String
    description: String
    organisation: String
    state: DemarcheState
    link: String
  }

  type Dossier {
    id: ID
    state: DossierState
    demarche: DemarcheDescription
    champs(type: ChampType): [ChampValue]
  }

  type ChampValue {
    type: ChampType
    label: String
    value: String
  }

  type Champ {
    type: ChampType
    label: String
    description: String
    required: Boolean
  }

  enum DemarcheState {
    BROUILLON
    PUBLIEE
    ARCHIVEE
  }

  enum DossierState {
    BROUILLON
    EN_CONSTRUCTION
    EN_INSTRUCTION
    ACCEPTE
    REFUSE
    SANS_SUITE
  }

  enum ChampType {
    ADDRESS
    BOOLEAN
    CADASTRE
    CHECKBOX
    CIVILITE
    DATE
    DATETIME
    DEPARTEMENTS
    DOSSIER_LINK
    DROP_DOWN_LIST
    EMAIL
    ENGAGEMENT
    EXPLICATION
    HEADER_SECTION
    LINKED_DROP_DOWN_LIST
    MULTIPLE_DROP_DOWN_LIST
    NUMBER
    PAYS
    PHONE
    PIECE_JUSTIFICATIVE
    REGIONS
    SIRET
    TEXT
    TEXTAREA
    YES_NO
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  introspection: true,
  playground: true,
  tracing: true,
  cors: true,
  context: ({
    req: {
      headers: { authorization }
    }
  }) => {
    return {
      authorization: process.env.DS_BASIC_AUTH || authorization,
      token: authorization ? authorization.slice(7) : null
    };
  }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
