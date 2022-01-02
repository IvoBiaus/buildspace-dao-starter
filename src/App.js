import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

import { shortenAddress } from "./utils";
import Form from "./components/form";

// Instantiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// Reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0xe030ca91AA67c669C2Bc83F49129c365A212530F"
);

// Reference to our ERC-20 contract.
const tokenModule = sdk.getTokenModule(
  "0xd83be2C94109f73e3d86cb108D0CE391Eccb8fc0"
);

// The voting contract.
const voteModule = sdk.getVoteModule(
  "0x2117AADA99eDB830a2FedFF59c5933C1Ad0dCAeE"
);

const App = () => {
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const { connectWallet, address, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((err) => {
        console.error("Failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // Check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        }
      })
      .catch((err) => {
        console.error("Failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  // Grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Members addresses", addresess);
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("Failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // Grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("Failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  // Combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // Give the signer to the sdk
    // which enables to interact with the deployed contract
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("Failed to NFT balance", error);
      });
  }, [address]);

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
      .claim("0", 1)
      .then(() => {
        setHasClaimedNFT(true);
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      })
      .catch((err) => {
        console.error("failed to claim", err);
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  const onVoteSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    //Prevent double clicks
    setIsVoting(true);

    const votes = proposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        //abstain by default
        vote: 2,
      };
      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );

        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    });

    // Check the user delegates their token to vote
    try {
      // Check if the wallet needs to delegate their tokens before they can vote
      const delegation = await tokenModule.getDelegationOf(address);
      // if the delegation is the 0x0 address means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        // if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await tokenModule.delegateTo(address);
      }

      // Vote on the proposals
      try {
        await Promise.all(
          votes.map(async (vote) => {
            // Get the latest state of the proposal
            const proposal = await voteModule.get(vote.proposalId);
            // Check if the proposal is open for voting (state === 1 means it is open)
            if (proposal.state === 1) {
              return voteModule.vote(vote.proposalId, vote.vote);
            }
            return;
          })
        );
        try {
          await Promise.all(
            votes.map(async (vote) => {
              // Get the latest state of the proposal again, since we may have just voted before
              const proposal = await voteModule.get(vote.proposalId);

              // If the state is 4 (it is ready to execute), execute it
              if (proposal.state === 4) {
                return voteModule.execute(vote.proposalId);
              }
            })
          );

          setHasVoted(true);
          console.log("Successfully voted");
        } catch (err) {
          console.error("Failed to execute votes", err);
        }
      } catch (err) {
        console.error("Failed to vote", err);
      }
    } catch (err) {
      console.error("Failed to delegate tokens");
    } finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      setIsVoting(false);
    }
  };

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to LastnameDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <Form
        proposals={proposals}
        isVoting={isVoting}
        hasVoted={hasVoted}
        memberList={memberList}
        onSubmit={onVoteSubmit}
      />
    );
  }

  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button disabled={isClaiming} onClick={() => mintNft()}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
