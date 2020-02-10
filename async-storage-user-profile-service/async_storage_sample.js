import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { createInstance } from '@optimizely/react-sdk';
import { Text } from 'react-native';

import datafile from './datafile';

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

const optimizelyClientInstance = createInstance({ datafile, userProfileService });
const userId = '10431130345';

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
  }

  async componentDidMount() {
    const attributes = { $opt_experiment_bucket_map: await customAsyncLookup(userId) };
    const variation = optimizelyClientInstance.activate('ab_running_exp_untargeted', userId, attributes);
    this.setState({ variation });
  }

  render() {
    const { variation } = this.state;
    return <Text>Variation: { variation }</Text>;
  }
}
