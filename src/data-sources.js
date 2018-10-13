import { RESTDataSource } from 'apollo-datasource-rest';

export default function dataSources() {
  return {
    api: new DemarchesAPI()
  };
}

class DemarchesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.DS_HOST || 'http://localhost:3000/api/v1';
  }

  willSendRequest(request) {
    if (this.context.token) {
      request.params.set('token', this.context.token);
    }
    if (this.context.authorization) {
      request.headers.set('Authorization', this.context.authorization);
    }
  }

  async getDemarche(id) {
    const { procedure: demarche } = await this.get(`procedures/${id}`);

    return normalizeDemarche(demarche);
  }

  async getDemarches() {
    const { procedures: demarches } = await this.get(`procedures`);

    return demarches.map(normalizeDemarche);
  }

  async getDossier({ demarche, id }) {
    const { dossier } = await this.get(
      `procedures/${demarche.id}/dossiers/${id}`
    );

    return normalizeDossier(demarche, dossier);
  }

  async getDossiers(demarche) {
    const { dossiers } = await this.get(`procedures/${demarche.id}/dossiers`);

    return dossiers.map(dossier => normalizeDossier(demarche, dossier));
  }

  async getChamps(dossier) {
    return (await this.getDossier(dossier)).champs;
  }
}

function normalizeDossier(demarche, dossier) {
  dossier.id = dossier.id + '';
  dossier.state = normalizeDossierState(dossier.state);
  dossier.demarche = demarche;
  if (dossier.champs) {
    dossier.champs = dossier.champs
      .map(normalizeChampValue)
      .filter(({ type }) => !GEO_TYPES.includes(type));
  }
  return dossier;
}

const DOSSIER_STATES = {
  initiated: 'EN_CONSTRUCTION',
  received: 'EN_INSTRUCTION',
  closed: 'ACCEPTE',
  refused: 'REFUSE',
  without_continuation: 'SANS_SUITE'
};

function normalizeDossierState(state) {
  return DOSSIER_STATES[state];
}

function normalizeDemarche({
  id,
  label: title,
  archived_at,
  types_de_champ: champs,
  ...data
}) {
  const state = archived_at ? 'ARCHIVEE' : 'PUBLIEE';
  return {
    ...data,
    id: id + '',
    title,
    state,
    champs: champs.map(normalizeChamp)
  };
}

function normalizeChamp({
  type_champ: type,
  libelle: label,
  required,
  description
}) {
  return {
    type: type.toUpperCase(),
    label,
    description,
    required: required || false
  };
}

function normalizeChampValue({
  type_de_champ: { type_champ: type, libelle: label },
  value
}) {
  return {
    type: type.toUpperCase(),
    label,
    value
  };
}

const GEO_TYPES = ['USER_GEOMETRY', 'CADASTRE'];
