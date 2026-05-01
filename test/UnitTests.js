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

    const newfulfillmentStatus = true;
    await orderContract.updateFulfillmentStatus(newfulfillmentStatus);
    const updatedFulfillmentStatus = await orderContract.getFulfillmentStatus();
    console.log("Updated fulfillment status:", updatedFulfillmentStatus);
    expect(updatedFulfillmentStatus).to.equal(newfulfillmentStatus); // Fulfillment status should be updated to true (fulfilled)
   
    const newPaymentStatus = true;
    await orderContract.updatePaymentStatus(newPaymentStatus);
    const updatedPaymentStatus = await orderContract.getPaymentStatus();
    console.log("Updated payment status:", updatedPaymentStatus);
    expect(updatedPaymentStatus).to.equal(newPaymentStatus); // Payment status should be updated to true (paid)

    const itemNames = await orderContract.getItemNames();
    console.log("Items in the order:", itemNames);
    expect(itemNames).to.deep.equal(["item1", "item2"]);
    const itemPrices = await orderContract.getItemPrices();
    console.log("Item prices in the order:", itemPrices);
    expect(itemPrices).to.deep.equal([100, 200]);
    const itemQuantities = await orderContract.getItemQuantities();
    console.log("Item quantities in the order:", itemQuantities);
    expect(itemQuantities).to.deep.equal(["1", "2"]);

    }); 
  });
  describe("Bussiness Update Address", function () {
    it("Should allow a business to update their address", async function () {
      const { businessRegistry, owner } = await loadFixture(deployBusinessRegistryFixture);
      const otheraddress = "0x2546BcD3c84621e976D8185a91A922aE77ECEc30";

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      const businessInfoBefore = await businessRegistry.getBusinessByAddress(owner.address);
  
      console.log("Business info before update:", businessInfoBefore.name, businessInfoBefore.id);
      // Update the business info
      await businessRegistry.updateBusinessWallet(owner.address, otheraddress, "chicken");
  
      const businessInfoAfter = await businessRegistry.getBusinessByAddress(otheraddress);

      console.log("Business info after update:", businessInfoAfter.name, businessInfoAfter.id);

      console.log("Test Address:", otheraddress);
      console.log("Test Address:", owner.address);

      expect(businessInfoAfter.id).to.equal("chicken")
      expect(businessInfoAfter.name).to.equal("Test Business")

    });
  });
  describe("Bussiness Access Criteria", function () {
    it("Should allow a business to be obtained by various criteria", async function () {
      const { businessRegistry, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      const businessRegistred = await businessRegistry.getBusinessByAddress(owner.address);
  
      const businessById = await businessRegistry.getBusinessById("chicken");
      const businessByName = await businessRegistry.getBusinessByName("Test Business");

      console.log("Business info by address:", businessRegistred.name, businessRegistred.id);
      console.log("Business info by ID:", businessById);
      console.log("Business info by name:", businessByName);

      expect(businessById).to.equal(businessByName);
    
    }); 
  });
  describe("Bussiness Existence", function () {
    it("Should allow a check for buisness existance", async function () {
      const { businessRegistry, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      const businessInfoBefore = await businessRegistry.getBusinessByAddress(owner.address);
  
      console.log("Business info before update:", businessInfoBefore.name, businessInfoBefore.id);
      
      const businessExists = await businessRegistry.businessExists("Test Business");
      console.log("Business exists:", businessExists);

      expect(businessExists).to.equal(true)

    });
  });
  describe("All Orders From Order Factory", function () {
    it("Should allow printing of all orders", async function () {
      const { businessRegistry, orderFactory, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      const business = await businessRegistry.getBusinessByAddress(owner.address);

      // Create an order contract for the registered business
      const tx = await orderFactory.createOrderContract(owner.address, ["item1", "item2"], [100, 200], ["1", "2"]);
      const receipt = await tx.wait();

      const tx2 = await orderFactory.createOrderContract(owner.address, ["item3", "item4"], [100, 200], ["1", "2"]);
      const receipt2 = await tx2.wait();

      const ordersFromFactory = await orderFactory.getAllOrders();

      console.log("Orders from factory:", ordersFromFactory);

      expect(ordersFromFactory.length).to.equal(2)
  
    });
  });
  describe("Order By Business From Order Factory", function () {
    it("Should allow a business to print out orders", async function () {
      const { businessRegistry, orderFactory, owner } = await loadFixture(deployBusinessRegistryFixture);

      // Register a business
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      const business = await businessRegistry.getBusinessByAddress(owner.address);

      // Create an order contract for the registered business
      const tx = await orderFactory.createOrderContract(owner.address, ["item1", "item2"], [100, 200], ["1", "2"]);
      const receipt = await tx.wait();

      const tx2 = await orderFactory.createOrderContract(owner.address, ["item3", "item4"], [100, 200], ["1", "2"]);
      const receipt2 = await tx2.wait();

      const ordersFromFactory = await orderFactory.getOrdersByBusiness(owner.address);

      console.log("Orders from factory:", ordersFromFactory);


      //check if null
      //will check details next test
      expect(orderFactory).to.not.equal(null)

    });
  });
  
   describe("Orders Details From Order Factory", function () {
    it("Should allow a business to  get order details", async function () {
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
      
      const [address, names, prices, quantities, paymentstatus, fulfillmentstatus] = await orderFactory.getOrderDetail(orderContractAddress);

      console.log("Order details retrieved from factory:", {
        address,
        names,
        prices,
        quantities,
        paymentstatus,
        fulfillmentstatus
      });

      expect(address).to.equal(owner.address)
      expect(names).to.deep.equal(["item1", "item2"])
      expect(prices).to.deep.equal([100n, 200n])
      expect(quantities).to.deep.equal(["1", "2"])
      expect(paymentstatus).to.equal(false)
      expect(fulfillmentstatus).to.equal(false)


    });
  });
});



describe("Negative Paths", function () {
  // Rejecting bad calls
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBusinessRegistryFixture() {


    // Contracts are deployed using the first signer/account by default
    const [owner, stranger] = await ethers.getSigners();

    const businessRegistry = await ethers.deployContract("BusinessRegistry");
    const orderFactory = await ethers.deployContract("OrderFactory", [businessRegistry.target]);

    return { businessRegistry, orderFactory, owner, stranger };
  }

  describe("Reject registered buisness from non-admin caller", function () {
    it("Not allow buisness to be resistered", async function () {
      const { businessRegistry, owner, stranger } = await loadFixture(deployBusinessRegistryFixture);

        // Register a hack business
          await expect(businessRegistry.connect(stranger).registerBusiness(stranger.address, "Hacker Business","chicken")).to.be.reverted;
    });
  });

  describe("Reject duplicate buisness name", function () {
    it("Doesn't allow duplicate names to be registered", async function () {


      const { businessRegistry, owner, stranger } = await loadFixture(deployBusinessRegistryFixture);
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      await expect(businessRegistry.connect(stranger).registerBusiness(stranger.address, "Test Business","chicken")).to.be.reverted;

    });
  });

  describe("Rejects a duplicate buisness ID", function () {
    it("Doesn't allow duplicate id's to be registered I.E Chicken", async function () {

      const { businessRegistry, owner, stranger } = await loadFixture(deployBusinessRegistryFixture);
      await businessRegistry.registerBusiness(owner.address,"Test Business", "chicken");

      await expect(businessRegistry.connect(stranger).registerBusiness(stranger.address, "Test Business","chicken")).to.be.reverted;
    });
  });

  describe("Rejects empty name or ID", function () {
    it("Doesn't allow blank ids or names", async function () {
      const { businessRegistry, owner, stranger } = await loadFixture(deployBusinessRegistryFixture);
      await expect(businessRegistry.registerBusiness(stranger.address, "","")).to.be.reverted;
    });
  });
});