import {
  createThirdwebClient,
  prepareContractCall,
  sendAndConfirmTransaction,
  sendTransaction,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import pkg from "linkdrop-p2p-sdk";
import crypto from "crypto";
import { configDotenv } from "dotenv";
configDotenv();
const { LinkdropP2P } = pkg;
const baseUrl = "https://base-colors-test.vercel.app";
import { getContract } from "thirdweb";
import { decodeFunctionData } from "viem";
import { approve } from "thirdweb/extensions/erc721";

const escrowContractABI = [
  {
    inputs: [{ internalType: "address", name: "relayer_", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "transferId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "tokenType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "amount",
        type: "uint128",
      },
    ],
    name: "Cancel",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "transferId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint120",
        name: "expiration",
        type: "uint120",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "tokenType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "amount",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "address",
        name: "feeToken",
        type: "address",
      },
      { indexed: false, internalType: "uint128", name: "fee", type: "uint128" },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "transferId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "tokenType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "amount",
        type: "uint128",
      },
    ],
    name: "Redeem",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "transferId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "tokenType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "amount",
        type: "uint128",
      },
    ],
    name: "Refund",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint128",
        name: "claimFee",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "depositFee",
        type: "uint128",
      },
    ],
    name: "UpdateFees",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "relayer",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "active", type: "bool" },
    ],
    name: "UpdateRelayer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "feeReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithdrawFees",
    type: "event",
  },
  {
    inputs: [],
    name: "EIP712_DOMAIN_TYPEHASH",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_TRANSFER_TYPE_HASH",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "accruedFees",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
    ],
    name: "cancel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "data_", type: "bytes" }],
    name: "decodeOnERC721ReceivedData",
    outputs: [
      { internalType: "address", name: "transferId", type: "address" },
      { internalType: "uint120", name: "expiration", type: "uint120" },
      { internalType: "uint128", name: "feeAmount", type: "uint128" },
      { internalType: "bytes", name: "feeAuthorization", type: "bytes" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
      { internalType: "uint256", name: "tokenId_", type: "uint256" },
      { internalType: "uint128", name: "amount_", type: "uint128" },
      { internalType: "uint120", name: "expiration_", type: "uint120" },
      { internalType: "uint128", name: "feeAmount_", type: "uint128" },
      { internalType: "bytes", name: "feeAuthorization_", type: "bytes" },
    ],
    name: "depositERC1155",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
      { internalType: "uint256", name: "tokenId_", type: "uint256" },
      { internalType: "uint120", name: "expiration_", type: "uint120" },
      { internalType: "uint128", name: "feeAmount_", type: "uint128" },
      { internalType: "bytes", name: "feeAuthorization_", type: "bytes" },
    ],
    name: "depositERC721",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "deposits",
    outputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint128", name: "amount", type: "uint128" },
      { internalType: "uint120", name: "expiration", type: "uint120" },
      { internalType: "uint8", name: "tokenType", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "domain",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "version", type: "string" },
      { internalType: "uint256", name: "chainId", type: "uint256" },
      { internalType: "address", name: "verifyingContract", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "sender_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
    ],
    name: "getDeposit",
    outputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint8", name: "tokenType", type: "uint8" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint128", name: "amount", type: "uint128" },
      { internalType: "uint120", name: "expiration", type: "uint120" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator_", type: "address" },
      { internalType: "address", name: "from_", type: "address" },
      { internalType: "uint256", name: "tokenId_", type: "uint256" },
      { internalType: "uint256", name: "amount_", type: "uint256" },
      { internalType: "bytes", name: "data_", type: "bytes" },
    ],
    name: "onERC1155Received",
    outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator_", type: "address" },
      { internalType: "address", name: "from_", type: "address" },
      { internalType: "uint256", name: "tokenId_", type: "uint256" },
      { internalType: "bytes", name: "data_", type: "bytes" },
    ],
    name: "onERC721Received",
    outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiver_", type: "address" },
      { internalType: "address", name: "sender_", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "bytes", name: "receiverSig_", type: "bytes" },
    ],
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiver_", type: "address" },
      { internalType: "address", name: "sender_", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
      { internalType: "bytes", name: "receiverSig_", type: "bytes" },
      { internalType: "bytes", name: "senderSig_", type: "bytes" },
    ],
    name: "redeemRecovered",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender_", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
    ],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "relayers",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "relayer_", type: "address" },
      { internalType: "bool", name: "active_", type: "bool" },
    ],
    name: "setRelayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender_", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "transferId_", type: "address" },
      { internalType: "uint256", name: "tokenId_", type: "uint256" },
      { internalType: "uint128", name: "amount_", type: "uint128" },
      { internalType: "uint120", name: "expiration_", type: "uint120" },
      { internalType: "address", name: "feeToken_", type: "address" },
      { internalType: "uint128", name: "feeAmount_", type: "uint128" },
      { internalType: "bytes", name: "feeAuthorization_", type: "bytes" },
    ],
    name: "verifyFeeAuthorization",
    outputs: [{ internalType: "bool", name: "isValid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token_", type: "address" }],
    name: "withdrawAccruedFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

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

const contract = getContract({
  client,
  chain: defineChain(8453),
  address: "0x7Bc1C072742D8391817EB4Eb2317F98dc72C61dB",
});

const wallet = privateKeyToAccount({
  client,
  privateKey: process.env.PRIVATE_KEY,
});

const fn = async () => {
  const from = wallet.address; // Sender's Ethereum address
  const token = "0x7Bc1C072742D8391817EB4Eb2317F98dc72C61dB"; // token contract address
  const tokenType = "ERC721";
  const chainId = 8453; // network chain ID
  const tokenId = "11480";

  const claimLink = await sdk.createClaimLink({
    from,
    token,
    chainId,
    tokenType,
    tokenId,
  });

  const sendTx = async ({ to, value, data }) => {
    console.log(to, value, data);
    const escrowContract = getContract({
      client,
      chain: defineChain(8453),
      address: to,
      abi: escrowContractABI,
    });

    const approveTx = approve({
      contract: contract,
      to,
      tokenId,
    });

    const sendApproveTx = await sendAndConfirmTransaction({
      account: wallet,
      transaction: approveTx,
    });

    console.log("successfully approved", sendApproveTx.transactionHash);

    const { args } = decodeFunctionData({
      abi: escrowContractABI,
      data: data,
    });

    const transaction = await prepareContractCall({
      contract: escrowContract,
      method:
        "function depositERC721(address token_, address transferId_, uint256 tokenId_, uint120 expiration_, uint128 feeAmount_, bytes feeAuthorization_) payable",
      params: args,
      value: 33300000000000n,
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account: wallet,
      transaction,
    });

    return { hash: transactionReceipt.transactionHash };
  };

  const { claimUrl, transferId, txHash } = await claimLink.deposit({
    sendTransaction: sendTx,
  });

  console.log(claimUrl, transferId, txHash);
};

fn();

// const redeem = async () => {
//   try {
//     const claimLink = await sdk.getClaimLink(
//       "https://base-colors-test.vercel.app/#/code?k=B4UBVTjuZfKheGLWV1yGW8ap1WnGHmeqnQy2K1ZXSHz&c=8453&v=3&src=p2p"
//     );
//     const dest = "0xf7d4041e751E0b4f6eA72Eb82F2b200D278704A4";
//     const claimTxHash = await claimLink.redeem(dest);
//     console.log(claimTxHash);
//   } catch (e) {
//     console.error(e);
//   }
// };

// redeem();
