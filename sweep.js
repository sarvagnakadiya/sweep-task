const { ethers } = require("ethers");
const erc20ABI = require("./src/artifacts/contracts/erc20.sol/Sweep.json").abi;
const providerUrl = "http://127.0.0.1:8545/";
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const path = "m/44'/60'/0'/0";
const mnemonic =
  "bonus typical congress kitten chat boost wasp rebel cushion hungry lunch sentence"; // Replace with your actual mnemonic

const seed = ethers.utils.mnemonicToSeed(mnemonic);
const hdNode = ethers.utils.HDNode.fromSeed(seed);
console.log("Master address: " + hdNode.address);
console.log("Master privateKey: " + hdNode.privateKey);

const targetAddress = "0xC9af5F4ACfE9e500e2eEb4542f79deb94Dc26A2c"; // Replace this with your target address
const depositAddresses = [
  "0xF5D1c85a17376D22A77699396275bcBf94e7f796",
  "0x44BA1e16BaA960FDE9A6e1DED5b46cAE08026C49",
]; // Replace with your deposit addresses
const erc20TokenAddresses = [
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
]; // Replace with your ERC20 token addresses

async function checkTargetBalance() {
  const balanceInWei = await provider.getBalance(
    "0xC9af5F4ACfE9e500e2eEb4542f79deb94Dc26A2c"
  );
  const balanceInEther = ethers.utils.formatEther(balanceInWei);
  console.log(`\nBalance of target address  ${balanceInEther} Ether\n`);
  return balanceInEther;
}
checkTargetBalance();

// For testing purpose sending some ETH to the deposit Address (Also it will be needed for sending the transaction)
async function sendInitialFunds() {
  // this is Hardhat account [0]
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  ).connect(provider);

  let nonce = await provider.getTransactionCount(wallet.address);
  let send_token_amount = "1";
  let gas_limit = "0x100000";
  for (let i = 0; i < depositAddresses.length; i++) {
    const tx = {
      from: await wallet.getAddress(),
      to: depositAddresses[i],
      value: ethers.utils.parseEther(send_token_amount),
      nonce: nonce++,
      gasLimit: ethers.utils.hexlify(gas_limit), // 100000
      gasPrice: 406142762,
    };
    await wallet.sendTransaction(tx).then((txObj) => {
      console.log(
        `${send_token_amount} ETH transferred to ${depositAddresses[i]} with transaction Hash: ${txObj.hash}\n `
      );
    });
  }

  console.log("Initial Transfer Successful!\n\n");
  for (let i = 0; i < depositAddresses.length; i++) {
    const address = depositAddresses[i];
    const balanceInWei = await provider.getBalance(address);
    const balanceInEther = ethers.utils.formatEther(balanceInWei);
    console.log(`Balance of address ${address}: ${balanceInEther} Ether\n`);
  }
}

async function main() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:8545/"
    );

    //give Initial funds only if we are in test network
    if (providerUrl === "http://127.0.0.1:8545/") await sendInitialFunds();

    // Sweep native coins (ETH)
    await sweepNativeCoins(depositAddresses);
    await checkTargetBalance();

    // Sweep ERC20 tokens
    await sweepERC20Tokens(depositAddresses, erc20TokenAddresses);
  } catch (error) {
    if (
      error.code === ethers.errors.UNSUPPORTED_OPERATION &&
      error.operation === "getResolver"
    ) {
      console.warn(
        "ENS is not supported on this network. The error is safe to ignore if you're not using ENS."
      );
    } else {
      throw error;
    }
  }
}

async function getPrivateKey(targetChildPublicKey) {
  let found = false;
  let i = 0;
  while (!found) {
    const childNode = hdNode.derivePath(`${path}/${i}`);

    const childPublicKey = childNode.address;

    // Check if the current child's public key matches the target public key
    if (childPublicKey === targetChildPublicKey) {
      found = true;
      //   console.log(`Child Address: ${childNode.address}`);
      //   console.log(`Child Private Key: ${childNode.privateKey}`);
      return childNode.privateKey;
    }

    i++;
    if (i > 100) {
      // Exit loop to prevent infinite searching (you can adjust the limit as needed)
      console.log("Child public key not found.");
      break;
    }
  }
}
// getPrivateKey("0xF5D1c85a17376D22A77699396275bcBf94e7f796");

async function sweepNativeCoins(depositAddresses) {
  for (const address of depositAddresses) {
    const pvtKey = await getPrivateKey(address);
    const wallet = new ethers.Wallet(pvtKey).connect(provider);
    const balance = await provider.getBalance(address);

    const balanceInEther = ethers.utils.formatEther(balance);
    console.log(`Native token balance of ${address} is: ${balanceInEther}`);

    if (balance.gt(ethers.constants.Zero)) {
      const valueInWei = ethers.utils.parseUnits("0.01", "ether");
      const valueToSend = balance.sub(valueInWei);

      // uncomment this to keep gas fees according to the network
      /* const gasPrice = await provider.getGasPrice();
      console.log("Current gas price:", gasPrice.toString());
       const gasLimit = 210000; // Adjust gas limit as needed
      const gasFees = gasPrice.mul(gasLimit);
      const valueToSend = balance.sub(gasFees);  */

      console.log(`Sweeping native coins from ${address}`);

      const tx = await wallet.sendTransaction({
        to: targetAddress,
        value: valueToSend,
        gasLimit: 21000, // Adjust gas limit as needed
      });
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Sweep completed!\n");
    } else {
      console.log(`No native coins to sweep from ${address}`);
    }
  }
}

async function sweepERC20Tokens(depositAddresses, erc20TokenAddresses) {
  for (const tokenAddress of erc20TokenAddresses) {
    const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, provider);

    for (const address of depositAddresses) {
      const balance = await erc20Contract.balanceOf(address);
      if (balance.gt(ethers.constants.Zero)) {
        console.log(
          `Sweeping ${balance.toString()} tokens from ${address} (Token: ${tokenAddress})`
        );

        const pvtKey = await getPrivateKey(address);
        const wallet = new ethers.Wallet(pvtKey).connect(provider);

        const batchTx = await erc20Contract
          .connect(wallet)
          .transfer(targetAddress, balance);
        console.log("Transfer transaction hash:", batchTx.hash);
        await batchTx.wait();

        console.log("Sweep completed!\n");
      } else {
        console.log(
          `No tokens to sweep from ${address} (Token: ${tokenAddress})`
        );
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
