import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { createInstance } from '@optimizely/react-sdk';
import { Text } from 'react-native';

const userProfileService = {
  lookup: (userId) => {
    // Keeping lookup empty because we are using an async storage implementation
  },
  save: userProfileMap => {
    const {
      user_id: userId,
      experiment_bucket_map: experimentBucketMap,
    } = userProfileMap;
    AsyncStorage.setItem(userId, JSON.stringify(experimentBucketMap))
      .then(() => console.log('User Profile saved successfully'))
      .catch(err => console.log('Failed to save User Profile', err));
  },
};

// Implementing custom lookup because ReactNative-Async-Storage is async
// lookup the users experiment_bucket_map
const customAsyncLookup = async (userId) => {
  const experimentBucketMap = await AsyncStorage.getItem(userId);
  return !!experimentBucketMap ? JSON.parse(experimentBucketMap) : {};
};

export default class AsyncStorageSample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { variation: '' };
    this.userId = '10431130345';
    this.optimizelyClientInstance = createInstance({ datafile, userProfileService });
  }

  async componentDidMount() {
    const attributes = { $opt_experiment_bucket_map: await customAsyncLookup(this.userId) };
    const variation = this.optimizelyClientInstance.activate('ab_running_exp_untargeted', this.userId, attributes);
    this.setState({ variation });
  }

  render() {
    const { variation } = this.state;
    return <Text>Variation: { variation }</Text>;
  }
}

// Datafile definition will not be part of actual sample
const datafile = {
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
