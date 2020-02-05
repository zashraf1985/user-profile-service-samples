const { StorageArea } = require('kv-storage-polyfill');
const optimizelySdk = require('@optimizely/optimizely-sdk');
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

const optimizelyClientInstance = optimizelySdk.createInstance({
  datafile: {
      "version": "4",
      "rollouts": [],
      "anonymizeIP": true,
      "projectId": "10431130345",
      "variables": [],
      "featureFlags": [],
      "experiments": [
          {
              "status": "Running",
              "key": "ab_running_exp_untargeted",
              "layerId": "10417730432",
              "trafficAllocation": [
                  {
                      "entityId": "10418551353",
                      "endOfRange": 10000
                  }
              ],
              "audienceIds": [],
              "variations": [
                  {
                      "variables": [],
                      "id": "10418551353",
                      "key": "all_traffic_variation"
                  },
                  {
                      "variables": [],
                      "id": "10418551354",
                      "key": "no_traffic_variation"
                  },
                  {
                      "variables": [],
                      "id": "10418551355",
                      "key": "no_traffic_variation_2"
                  },
                  {
                      "variables": [],
                      "id": "10418510624",
                      "key": "a"
                  }
              ],
              "forcedVariations": {},
              "id": "10420810910"
          },
      ],
      "audiences": [
      ],
      "groups": [],
      "attributes": [
          {
              "id": "10401066170",
              "key": "customattr"
          }
      ],
      "accountId": "10367498574",
      "events": [
      ],
      "revision": "241"
  },
  userProfileService,
});