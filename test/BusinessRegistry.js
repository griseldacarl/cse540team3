const { loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const { ethers } = require("hardhat");

describe("BusinessRegistry", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBusinessRegistryFixture() {


    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const businessRegistry = await ethers.deployContract("BusinessRegistry");
    const orderFactory = await ethers.deployContract("OrderFactory", [businessRegistry.target]);

    return { businessRegistry, orderFactory, owner };
  }

  describe("Business Registration", function () {
    it("Should allow a business to register and retrieve their info", async function () {
      const { businessRegistry, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      // Retrieve the business info by address
      const businessInfo = await businessRegistry.getBusinessByAddress(owner.address);

      console.log("Retrieved business info:", businessInfo);
      console.log("Owner address:", owner.address);
      console.log("Business name from contract:", businessInfo.name);
      console.log("Business ID from contract:", businessInfo.id);
      // Check that the retrieved info matches what was registered
     // expect(businessInfo.wallet).to.equal(owner.address);  
      expect(businessInfo.name).to.equal("Test Business");
    
    });
  });
  describe("Orders", function () {
    it("Should allow a business to create an order contract", async function () {
      const { businessRegistry, orderFactory, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      // Create an order contract for the registered business
      const tx = await orderFactory.createOrderContract(owner.address, ["item1", "item2"], [100, 200], ["1", "2"]);
      const receipt = await tx.wait();

      //console.log("Order contract creation transaction receipt:", receipt);

      // Check that the OrderContractCreated event was emitted with the correct parameters
      expect(receipt).to.emit(orderFactory, "OrderContractCreated")
        .withArgs(owner.address, anyValue); 
    });
  });
  describe("Order Details", function () {
    it("Should allow retrieval of order details", async function () {
      const { businessRegistry, orderFactory, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      // Create an order contract for the registered business
    const tx = await orderFactory.createOrderContract(owner.address, ["item1", "item2"], [100, 200], ["1", "2"]);
    const receipt = await tx.wait();

    const orderContractAddress = receipt.logs
      .map(log => {
        try {
          return orderFactory.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(event => event?.name === "OrderContractCreated")?.args[1];

    console.log("Created order contract address:", orderContractAddress);
    // Attach to the order contract and retrieve details

    const OrderContract = await ethers.getContractFactory("OrderContract");
    const orderContract = OrderContract.attach(orderContractAddress);
    console.log("Order details retrieved from contract:", orderContract);
    const orderDetails = await orderContract.getOrder();
    console.log("Order details retrieved from contract:", orderDetails);
    const paymentStatus = await orderContract.getPaymentStatus();
    const fulfillmentStatus = await orderContract.getFulfillmentStatus();
    console.log("Payment status:", paymentStatus);
    console.log("Fulfillment status:", fulfillmentStatus);

    expect(paymentStatus).to.equal(false); // Default payment status should be false (unpaid)
    expect(fulfillmentStatus).to.equal(false); // Default fulfillment status should be false (unfulfilled)
   
    }); 
  });  
});
