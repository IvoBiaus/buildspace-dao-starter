import sdk from "./1-initialize-sdk.js";

// Grab the app module address.
const appModule = sdk.getAppModule(
  "0x2234A6Ed9B7A1cb1f83782b1A035F34ceEF2945E"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Governance contract name.
      name: "LastnameDAO's Proposals",

      // Location of the governance token, the ERC-20 contract
      votingTokenAddress: "0xd83be2C94109f73e3d86cb108D0CE391Eccb8fc0",

      // After a proposal is created, when can members start voting?
      proposalStartWaitTimeInSeconds: 0,

      // How long do members have to vote on a proposal when it's created?
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      votingQuorumFraction: 0,
      minimumNumberOfTokensNeededToPropose: "1000",
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address
    );
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();
