require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const proxy_url = "https://devnet.neonevm.org";
const network_id = 245022926;
const privateKeys = []; // Add private keys for Ethereum EOAs here

module.exports = {
  solidity: "0.8.4",
  networks: {
    neonlabs: {
      url: proxy_url,
      network_id: network_id,
      chainId: network_id,
      accounts: privateKeys,
      allowUnlimitedContractSize: false,
      timeout: 1000000,
      isFork: true,
    },
  },
};
