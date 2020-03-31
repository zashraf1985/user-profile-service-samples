const optimizelySdk = require('@optimizely/optimizely-sdk');

const datafile = require('./datafile');

const userProfileService = {
  
  lookup: (userId) => JSON.parse(window.localStorage.getItem(userId)),

  save: (userProfileMap) => {
    window.localStorage.setItem(userProfileMap.user_id, JSON.stringify(userProfileMap))
    console.log("Saved User Profile");
  },

};

const optimizelyClientInstance = optimizelySdk.createInstance({ datafile, userProfileService });

const testStorage = async () => {
  const userId = '10431130345';
  console.log('got variation', optimizelyClientInstance.activate('ab_running_exp_untargeted', userId));
};

testStorage();
