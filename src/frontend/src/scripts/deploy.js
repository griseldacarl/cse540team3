const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// This file auto deploys
async function main() {
  // Deploy contracts

    // Deploy BusinessRegistry
  const BusinessRegistry = await hre.ethers.getContractFactory("BusinessRegistry");
  const businessRegistry = await BusinessRegistry.deploy();
  await businessRegistry.waitForDeployment();

  console.log("BusinessRegistry deployed to:", await businessRegistry.getAddress());

  // Deploy OrderFactory
  const OrderFactory = await hre.ethers.getContractFactory("OrderFactory");
  const orderFactory = await OrderFactory.deploy(await businessRegistry.getAddress());
  await orderFactory.waitForDeployment();

  console.log("OrderFactory deployed to:", await orderFactory.getAddress());

  // --- AUTO UPDATE FRONTEND ---
  const frontendPath = path.resolve(__dirname, "../GovernmentABI");
  
  // Write address
  fs.writeFileSync(
    path.join(frontendPath, "orderFactoryAddress.js"),
    `export const orderFactoryAddress = "${await orderFactory.getAddress()}";\n`
  );

  // Write OrderFactory ABI
  const orderFactoryABI = OrderFactory.interface.formatJson();
  fs.writeFileSync(
    path.join(frontendPath, "orderFactoryABI.js"),
    `export const orderFactoryABI = ${orderFactoryABI};\n`
  );

  console.log("Frontend ABI & address updated!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});