# Token Sweep Script

This is a Node.js script that facilitates sweeping native coins (ETH) and ERC20 tokens from a list of deposit addresses to a specified target address. It uses the ethers.js library to interact with an Ethereum node via JSON-RPC.

## Requirements

Before running this script, make sure you have the following:

1. An Ethereum node running and accessible via JSON-RPC at `http://127.0.0.1:8545/`. You can change the provider URL to point to a different Ethereum node if needed.

2. Node.js and npm installed on your machine.

3. The required dependencies installed. To install them, run the following command in the script's directory:

   ```
   npm install
   ```

You can run the following command to get some dummy tokens(ERC20) to few deposit address (optional)

```
npx hardhat run scripts/deploy.js --network local
```

## Setup

1. Replace the `mnemonic` variable in the script with your actual mnemonic phrase. This mnemonic will be used to derive HD wallets for sweeping coins and tokens.

2. Replace the `targetAddress` variable with the Ethereum address where you want to sweep all the coins and tokens.

3. Replace the `depositAddresses` array with the Ethereum addresses from where you want to sweep coins and tokens. Add as many addresses as you want to sweep.

4. Replace the `erc20TokenAddresses` array with the addresses of the ERC20 tokens you want to sweep (if applicable).

## Running the Script

To run the script, execute the following command in the script's directory:

```
node sweep.js
```

The script will perform the following steps:

1. Send a small amount of ETH (0.01 ETH) to each deposit address for gas fees and testing purposes.

2. Sweep native coins (ETH) from each deposit address to the target address.

3. If ERC20 tokens are specified (`erc20TokenAddresses` array is not empty), sweep the specified ERC20 tokens from each deposit address to the target address.

The script will log the status of each operation, including transaction hashes for Ethereum transactions.

**Important Note:** Be careful when running this script on the mainnet or any real Ethereum network. Double-check all the variables and addresses before running it to prevent accidental loss of funds.

## Customization

You can customize the gas limit, gas price, and the amount of native coins (ETH) sent to each deposit address for testing purposes by modifying the respective variables in the script.

For ERC20 token transfers, the script currently assumes that the target address can hold the tokens. If the target address is a smart contract that can receive tokens, ensure it implements the necessary ERC20 token transfer functions. Otherwise, the token sweep will fail.

## Error Handling

The script includes basic error handling for unsupported operations related to ENS (Ethereum Name Service). If the script encounters an ENS-related error, it will display a warning message but continue execution.

## Disclaimer

Use this script at your own risk. It is meant for educational and testing purposes and should not be used without understanding its functionality and potential risks. Always double-check addresses and transactions before running the script on any real Ethereum network.
