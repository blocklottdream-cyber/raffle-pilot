// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const Raffle = await hre.ethers.deployContract("Raffle");
  await Raffle.waitForDeployment();
  console.log("Raffle deployed to:", await Raffle.getAddress());
}

main();
