import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0xe030ca91AA67c669C2Bc83F49129c365A212530F"
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // Specify conditions.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    // The membership NFT has a tokenId of 0
    // since it's the first token in our ERC-1155 contract
    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log(
      "✅ Successfully set claim condition on bundle drop:",
      bundleDrop.address
    );
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();
