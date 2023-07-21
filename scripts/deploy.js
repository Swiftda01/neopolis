const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("Neopolis");
  const contract = await Contract.deploy(7_800_000_000);

  await contract.deployed();
  console.log("Contract address is: ", contract.address);

  await contract.deployed();

  console.log("Neopolis contract deployed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
