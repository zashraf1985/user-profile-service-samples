import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {createInstance} from '@optimizely/react-sdk';
import {Text} from 'react-native';

export default class LocalStorage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variation: '',
    };
  }

  componentDidMount(): void {
    const userProfileService = {
      lookup: userId =>
        AsyncStorage.getItem(userId).then(variation => variation),
      save: userProfileMap => {
        const {
          user_id: userId,
          experiment_bucket_map: experimentBucketMap,
        } = userProfileMap;
        return AsyncStorage.setItem(userId, experimentBucketMap)
          .then(() => console.log('It worked!'))
          .catch(err => console.log('It failed!', err));
      },
    };

    const optimizelyClientInstance = createInstance({
      datafile: {
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
      },
      userProfileService,
    });

    const userId = '10431130345';
    const getMap = async () => {
      const map = await AsyncStorage.getItem(userId);
      return map ? map : {};
    };
    const attributes = {
      $opt_experiment_bucket_map: getMap(),
    };

    const result = optimizelyClientInstance.activate(
      'ab_running_exp_untargeted',
      userId,
      attributes,
    );
    this.setState({variation: result});
  }

  render() {
    const {variation} = this.state;
    return <Text>Variation: {variation}</Text>;
  }
}
