import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x2234A6Ed9B7A1cb1f83782b1A035F34ceEF2945E");

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // Token's name? Ex. "Ethereum"
      name: "LastnameDAO Governance Token",
      // Token's symbol? Ex. "ETH"
      symbol: "LSN",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("Failed to deploy token module", error);
  }
})();
