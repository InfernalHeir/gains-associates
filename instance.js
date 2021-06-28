const { Contract } = require("ethers");
const { V15 } = require("./constants");
const UNIFARMV15ABI = require("./constants/ABI/U15.json");

const { etherjs } = require("./helpers");
// provider
const provider = etherjs();

// setup UNIFARM V15
exports.V15Instance = new Contract(V15, UNIFARMV15ABI, provider);
