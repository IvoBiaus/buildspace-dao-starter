import { readFileSync } from "fs";

import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0xe030ca91AA67c669C2Bc83F49129c365A212530F"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        // Mmembership NFT information
        name: "Soul",
        description: "This NFT will give you access to LastnameDAO!",
        image: readFileSync("scripts/assets/soul.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
