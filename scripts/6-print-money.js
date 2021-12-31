import { ethers } from "ethers";

import sdk from "./1-initialize-sdk.js";

// This is the address of the ERC-20 contract
const tokenModule = sdk.getTokenModule(
  "0xd83be2C94109f73e3d86cb108D0CE391Eccb8fc0"
);

(async () => {
  try {
    // Max supply
    const amount = 1_000_000;
    // We use the util function from "ethers" to convert the amount
    // to have 18 decimals (which is the standard for ERC20 tokens).
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interact with your deployed ERC-20 contract and mint the tokens!
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    console.log(
      "✅ There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$LSN in circulation"
    );
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();
