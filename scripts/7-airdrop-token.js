import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// Address to the ERC-1155 membership NFT contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0xe030ca91AA67c669C2Bc83F49129c365A212530F"
);

// Address to the ERC-20 token contract.
const tokenModule = sdk.getTokenModule(
  "0xd83be2C94109f73e3d86cb108D0CE391Eccb8fc0"
);

(async () => {
  try {
    // Grab all the addresses of people who own our membership NFT, which has
    // a tokenId of 0.
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log("No NFTs have been claimed yet.");
      process.exit(0);
    }

    // Loop through the array of addresses.
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000.
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // Set up the target.
      const airdropTarget = {
        address,
        // We need 18 decimal places
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });

    // Call transferBatch on all our airdrop targets.
    console.log("🌈 Starting airdrop...");
    await tokenModule.transferBatch(airdropTargets);
    console.log(
      "✅ Successfully airdropped tokens to all the holders of the NFT!"
    );
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();
