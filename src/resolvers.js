import { filter } from 'lodash';

export default {
  Query: {
    async demarche(
      _,
      { id },
      {
        dataSources: { api }
      }
    ) {
      return api.getDemarche(id);
    }

    // async demarches(
    //   _,
    //   { ids },
    //   {
    //     dataSources: { api }
    //   }
    // ) {
    //   let demarches = await api.getDemarches();

    //   if (ids) {
    //     demarches = filter(demarches, isIn(ids));
    //   }

    //   return demarches;
    // }
  },

  Demarche: {
    async dossiers(
      root,
      { id, ids, state },
      {
        dataSources: { api }
      }
    ) {
      if (id) {
        let dossier = await api.getDossier({ demarche: root, id });

        if (state && dossier.state !== state) {
          return [];
        }

        return [dossier];
      }
      let dossiers = await api.getDossiers(root);

      if (ids) {
        dossiers = dossiers.filter(({ id }) => ids.includes(id));
      }
      if (state) {
        dossiers = filter(dossiers, { state });
      }
      return dossiers;
    }
  },

  Dossier: {
    async champs(
      root,
      { type },
      {
        dataSources: { api }
      }
    ) {
      let champs = root.champs;

      if (!champs) {
        champs = await api.getChamps(root);
      }
      if (type) {
        champs = filter(champs, { type });
      }

      return champs;
    }
  }
};
