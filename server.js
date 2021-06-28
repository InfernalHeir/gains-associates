const express = require("express");
const { json, urlencoded } = require("body-parser");
const { config } = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const {
  queryEvents,
  filterEventOutputs,
  fromWei,
  claimHistory
} = require("./helpers");
const { V15Instance } = require("./instance");
const { GAINS } = require("./constants");
const _ = require("lodash");

config();

const PORT = process.env.PORT;

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

// config helmet
app.use(helmet());
// enabled cors
app.use(cors());

// this route for fetching stakes of GAINS Associates
app.get("/gains/stakes", async (req, res) => {
  try {
    const stakeData = await queryEvents(V15Instance, "Stake", [
      null,
      null,
      null,
      GAINS,
      null,
      null
    ]);

    if (_.isEmpty(stakeData)) {
      return res.json({
        code: 200,
        message: "No Stakes Found."
      });
    }

    const blockNumbers = stakeData.map((items) => {
      return items.blockNumber;
    });

    const output = filterEventOutputs(stakeData);
    const response = output.map((items, index) => {
      const blockNumber = blockNumbers[index];
      return {
        stakeAmount: fromWei(String(items[4])),
        walletAddress: items[0],
        startTime: String(items[5]),
        blockNumber
      };
    });

    res.status(201).json({
      code: 200,
      data: response
    });
  } catch (err) {
    console.log(err.message);
    return res.json({
      code: 200,
      message: err.message
    });
  }
});

app.get("/gains/unStakes", async (req, res) => {
  try {
    const unStakeData = await queryEvents(V15Instance, "UnStake", [
      null,
      GAINS,
      null,
      null,
      null
    ]);

    const claimRecords = await queryEvents(V15Instance, "Claim", [
      null,
      GAINS,
      null,
      null,
      null
    ]);

    if (_.isEmpty(unStakeData) || _.isEmpty(claimRecords)) {
      return res.json({
        code: 200,
        message: "No Data Found."
      });
    }

    const response = unStakeData.map((items) => {
      const rewards = claimHistory(claimRecords, items.transactionHash);
      return {
        walletAddress: items.args[0],
        unStakedtokenAddress: items.args[1],
        unStakedAmount: fromWei(String(items.args[2])),
        unStaketime: String(items.args[3]),
        txHash: items.transactionHash,
        rewards
      };
    });
    res.status(201).json({
      code: 200,
      data: response
    });
  } catch (err) {
    console.log(err.message);
    return res.json({
      code: 200,
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Gains API Server is started on ${PORT} port.`);
});
