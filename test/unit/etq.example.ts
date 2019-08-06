const ETQ = {
  events: [
    {
      id: 'IA',
      value: 'IA',
      description: "Inici d'anestèsia",
      timestamp: '20190729102550',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: undefined
    },
    {
      id: 'FI',
      value: 'FI',
      description: "Fi d'inducció",
      timestamp: '20190729102550',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: undefined
    },
    {
      id: 'IC',
      value: 'IC',
      description: 'Inici cirurgía',
      timestamp: '20190729102550',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: undefined
    },
    {
      id: 'FC',
      value: 'FC',
      description: 'Fi cirurgía',
      timestamp: '20190729102550',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: undefined
    },
    {
      id: 'FA',
      value: 'FA',
      description: "Fi d'anestèsia",
      timestamp: '20190729102550',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: undefined
    }
  ],
  techniques: [
    {
      id: 'TR00470',
      value: 'TR00470',
      description: 'Anestèsia Inhalatòria',
      timestamp: '20190729102550',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: 'asdfasdf'
    },
    {
      id: 'TR00283',
      value: 'TR00283',
      description: 'Anestesia locoregional oftalmologica',
      timestamp: '20190724120415',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitaeultricies nunc. Donec fringilla nisi eros, ac tristique lectus ornarenon. Nulla quam justo, sollicitudin sed risus maximus, auctor tinciduntvelit. In rhoncus eu elit volutpat molestie. Proin eget dignissimligula, et blandit elit. Nullam sapien nisl, vestibulum non accumsantincidunt, finibus sit amet leo. Aenean arcu urna, ullamcorper sit ametligula sed, dictum suscipit urna. Phasellus in est id quam dapibusmolestie. Interdum et malesuada fames ac ante ipsum primis in faucibus.Integer vitae nibh in arcu accumsan condimentum a a metus. Prointincidunt, nibh sit amet vehicula dignissim, ante turpis vestibulumnulla, eu consectetur dolor sem non leo. Aenean in velit vitae purusporttitor faucibus non eu ex. Vivamus tempus orci eget nisl ultrices, acaliquam magna volutpat.'
    },
    {
      id: 'TR00194',
      value: 'TR00194',
      description: 'Anestèsia Local',
      timestamp: '20190724120424',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: 'Prova text 2'
    },
    {
      id: 'TR00194',
      value: 'TR00194',
      description: 'Anestèsia Local',
      timestamp: '20190724120441',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      comment: 'Prova text 3'
    }
  ],
  parameters: [
    {
      id: 'FC',
      description: 'FC',
      items: [
        {
          timestamp: '201908011238',
          comment: 'PROVA TEXT FC',
          owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
          value: 140,
          unit: 'PULS/M',
          abnormality: undefined
        }
      ]
    }
  ],
  analytic: [
    {
      id: 'GLICEMIA_CAP',
      description: 'GLICEMIA_CAP',
      items: [
        {
          timestamp: '201908011504',
          comment: 'PROVA TEXT GLICÈMIA',
          owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
          value: 150,
          unit: 'MG/L',
          abnormality: undefined
        }
      ]
    }
  ],
  airway: [
    {
      id: '03',
      value: '03',
      description: 'FIBROBRONCOSCOP',
      comment: 'Comentari via aerea 1',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      init: '20190802110224',
      end: '20190802120224'
    },
    {
      id: '02',
      value: '02',
      description: 'MASCARETA LARINGE',
      comment: 'Comentari via aerea 2',
      owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
      init: '20190802110224',
      end: '20190802120224'
    }
  ],
  respiration: [
    {
      id: 'DISPO_OXIGEN',
      description: 'DISPO_OXIGEN',
      items: [
        {
          timestamp: '201908011504',
          comment: 'PROVA TEXT DISPO OXIGEN',
          owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
          value: 'Marcareta venturi',
          unit: undefined,
          abnormality: undefined
        }
      ]
    }
  ],
  arterialPathways: [
    {
      id: '00010',
      description: 'ARTERIAL',
      items: [
        {
          comment: undefined,
          owner: { id: 'NABIO', name: 'Sol.licitant', surname: 'Sol.licitant' },
          init: '201908011504',
          end: '201908011604',
          value: 'CATÈTER ARTERIAL 18G Artèria braquial'
        }
      ]
    }
  ]
};
export default ETQ;
