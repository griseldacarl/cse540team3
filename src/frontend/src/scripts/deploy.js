const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// This file auto deploys
async function main() {
  // Deploy contract
  const OrderFactory = await hre.ethers.getContractFactory("OrderFactory");
  const orderFactory = await OrderFactory.deploy();
  await orderFactory.deployed();

  console.log("OrderFactory deployed to:", orderFactory.address);

  // --- AUTO UPDATE FRONTEND ---
  const frontendPath = path.resolve(__dirname, "../frontend/src/GovernmentABI");
  
  // Write address
  fs.writeFileSync(
    path.join(frontendPath, "orderFactoryAddress.js"),
    `export const orderFactoryAddress = "${orderFactory.address}";\n`
  );

  // Write ABI
  const abi = OrderFactory.interface.format(hre.ethers.utils.FormatTypes.json);
  fs.writeFileSync(
    path.join(frontendPath, "orderFactoryABI.js"),
    `export const orderFactoryABI = ${abi};\n`
  );

  console.log("Frontend ABI & address updated!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});