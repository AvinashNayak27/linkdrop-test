import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import pkg from "linkdrop-p2p-sdk";
import crypto from "crypto";
import { configDotenv } from "dotenv";
configDotenv();

const { LinkdropP2P } = pkg;
const baseUrl = "https://p2p.linkdrop.io";

const getRandomBytes = (length) => {
  return new Uint8Array(crypto.randomBytes(length));
};

const sdk = new LinkdropP2P({
  baseUrl,
  getRandomBytes,
  apiKey: process.env.LINKDROP_API_KEY,
});
// create the client with your clientId, or secretKey if in a server environment
const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET,
});

const wallet = privateKeyToAccount({
  client,
  privateKey: process.env.PRIVATE_KEY,
});

const fn = async () => {
  const ethersSigner = await ethers6Adapter.signer.toEthers({
    client,
    chain: defineChain(8453),
    account: wallet,
  });
  console.log(ethersSigner);

  const from = ethersSigner.address; // Sender's Ethereum address
  const token = "0x7Bc1C072742D8391817EB4Eb2317F98dc72C61dB"; // token contract address
  const tokenType = "ERC721";
  const chainId = 8453; // network chain ID
  const tokenId = "1016";

  const claimLink = await sdk.createClaimLink({
    from,
    token,
    chainId,
    tokenType,
    tokenId,
  });

  const sendTransaction = async ({ to, value, data }) => {
    const tx = await ethersSigner.sendTransaction({ to, value, data });
    return { hash: tx.hash };
  };
  const { claimUrl, transferId, txHash } = await claimLink.deposit({
    sendTransaction,
  });

  console.log(claimUrl, transferId, txHash);
};

fn();
