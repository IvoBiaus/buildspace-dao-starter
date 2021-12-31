import { ethers } from "ethers";
import { readFileSync } from "fs";

import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x2234A6Ed9B7A1cb1f83782b1A035F34ceEF2945E");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      // Collection information
      name: "LastnameDAO Membership",
      description: "A DAO where your lastname is represented on an shared NFT.",
      image: readFileSync("scripts/assets/lastname.png"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata()
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})();
