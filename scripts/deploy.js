const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with the account: ${deployer.address}`);

  await Promise.all(
    ["Neopolis", "NeopolisTwo"].map(async (contractName) => {
      const Contract = await hre.ethers.getContractFactory(contractName);
      const contract = await Contract.deploy(7_800_000_000);

      await contract.deployed();

      console.log(`${contractName} contract address is: ${contract.address}`);

      return contract.deployed();
    })
  );

  console.log("Contracts deployed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
