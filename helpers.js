const { providers, utils } = require("ethers");
const { config } = require("dotenv");
const _ = require("lodash");

const { formatEther, formatUnits, parseEther, parseUnits } = utils;
config();

const chainId = 4;
const NETWORK_API_KEY = process.env.NETWORK_API_KEY;

const etherjs = () => {
  const provider = new providers.InfuraProvider(chainId, NETWORK_API_KEY);
  return provider;
};

// initiate Provider
const ether = etherjs();

// getBlockTimeStamp
const getBlockTimeStamp = async () => {
  const blockNumber = await getBlockNumber();
  const blocktimeStamp = (await ether.getBlock(blockNumber)).timestamp;
  return blocktimeStamp;
};

// filterAnyEvent
const filterEvents = (instance, eventName, eventParams) => {
  return instance.filters[eventName](...eventParams);
};

// queryEvents
const queryEvents = async (instance, eventName, eventParams) => {
  const filter = filterEvents(instance, eventName, eventParams);
  const results = await instance.queryFilter(filter);
  return results;
};

//  getOneDayReward
const getOneDayReward = async (instance, methodParams, tokenSequence) => {
  var promises = [];
  for (var k = 0; k < tokenSequence.length; k++) {
    const address = tokenSequence[k];
    promises.push(instance.getOneDayReward(...methodParams));
  }
  return Promise.map(promises, (resolve) => {
    return resolve;
  });
};

// filterEventData
const filterEventOutputs = (eventData) => {
  if (_.isEmpty(eventData)) return null;
  return eventData.map((values) => {
    return values.args;
  });
};

// parseUnits return bignumber in STRING.
const toWei = (amount) => {
  return parseUnits(amount, "ether");
};

// parseEther returns number
const fromWei = (weiAmount) => {
  return Number(formatUnits(weiAmount, "ether"));
};

// getApy for any POOL Version GPRF (GET ONE DAY REWARD FIATED VALUE)
const getApy = (GODRF, useStakingAmountInUSD, Quater) => {
  if (!GODRF.length) return null;
  const RS = _.sum(GODRF);
  const lpShare = _.divide(RS, useStakingAmountInUSD);
  const ApyForNinetyDays = _.multiply(lpShare, 100);
  const APY = _.multiply(ApyForNinetyDays, Quater);
  return APY;
};

const claimHistory = (claim, transactionHash) => {
  if (_.isEmpty(claim)) return null;

  const filterAble = claim.filter((e) => {
    return (
      String(e.transactionHash).toLowerCase() ===
      String(transactionHash).toLowerCase()
    );
  });

  if (_.isEmpty(filterAble)) return null;
  return filterAble.map((value) => {
    return {
      rewardTokenAddress: String(value.args[2]),
      claimTokens: fromWei(String(value.args[3]))
    };
  });
};

module.exports = {
  etherjs,
  getApy,
  fromWei,
  toWei,
  filterEventOutputs,
  getOneDayReward,
  queryEvents,
  getBlockTimeStamp,
  claimHistory
};
