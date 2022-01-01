import { ethers } from "ethers";

import sdk from "./1-initialize-sdk.js";

// The governance contract.
const voteModule = sdk.getVoteModule(
  "0x2117AADA99eDB830a2FedFF59c5933C1Ad0dCAeE"
);

// The ERC-20 contract.
const tokenModule = sdk.getTokenModule(
  "0xd83be2C94109f73e3d86cb108D0CE391Eccb8fc0"
);

(async () => {
  try {
    // Give our treasury the power to mint additional token if needed.
    await tokenModule.grantRole("minter", voteModule.address);

    console.log(
      "✅ Successfully gave vote module permissions to act on token module"
    );
  } catch (error) {
    console.error(
      "Failed to grant vote module permissions on token module",
      error
    );
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    await tokenModule.transfer(voteModule.address, percent90);

    console.log("✅ Successfully transferred tokens to vote module");
  } catch (err) {
    console.error("Failed to transfer tokens to vote module", err);
  }
})();
