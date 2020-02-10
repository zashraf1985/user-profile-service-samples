export default datafile = {
  version: '4',
  rollouts: [],
  anonymizeIP: true,
  projectId: '10431130345',
  variables: [],
  featureFlags: [],
  experiments: [
    {
      status: 'Running',
      key: 'ab_running_exp_untargeted',
      layerId: '10417730432',
      trafficAllocation: [
        {
          entityId: '10418551353',
          endOfRange: 10000,
        },
      ],
      audienceIds: [],
      variations: [
        {
          variables: [],
          id: '10418551353',
          key: 'all_traffic_variation',
        },
        {
          variables: [],
          id: '10418551354',
          key: 'no_traffic_variation',
        },
        {
          variables: [],
          id: '10418551355',
          key: 'no_traffic_variation_2',
        },
        {
          variables: [],
          id: '10418510624',
          key: 'a',
        },
      ],
      forcedVariations: {},
      id: '10420810910',
    },
  ],
  audiences: [],
  groups: [],
  attributes: [
    {
      id: '10401066170',
      key: 'customattr',
    },
  ],
  accountId: '10367498574',
  events: [],
  revision: '241',
};
