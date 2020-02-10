const { StorageArea } = require('kv-storage-polyfill');
const optimizelySdk = require('@optimizely/optimizely-sdk');

const datafile = require('./datafile');

const storage = new StorageArea();

const userProfileService = {
    lookup: (userId) => {
      // Keeping lookup empty because we are using an async storage implementation
    },
    save: (userProfileMap) => {        
        const { user_id: userId, experiment_bucket_map: experimentBucketMap } = userProfileMap;
        storage.set(userId, experimentBucketMap);
        console.log("Saved User Profile");
    },
};

const optimizelyClientInstance = optimizelySdk.createInstance({ datafile, userProfileService });

// Implementing custom lookup because kv-storage is async
// lookup the users experiment_bucket_map
const customAsyncLookup = async (userId) => {
  return await storage.get(userId) || {}
};

const testStorage = async () => {
    const userId = '10431130345';

    const attributes = {
        $opt_experiment_bucket_map: await customAsyncLookup(userId)
    };
    console.log('got variation', optimizelyClientInstance.activate('ab_running_exp_untargeted', userId, attributes));
};

testStorage();
