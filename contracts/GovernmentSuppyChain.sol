// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract GovernmentSupplyChain {

  struct Product {
    string name;
    uint256 quantity;
    address supplier;
    bool isDelivered;
  }
  struct Order {
    uint256 id;
    Product product;
    address buyer;
    bool isApproved;
  }
  struct Vendor {
    address vendorAddress;
    string name;
    bool isRegistered;
  }
  struct Contractor {
    address contractorAddress;
    string name;
    bool isRegistered;
  }
  struct GovernmentAgency {
    address agencyAddress;
    string name;
    bool isRegistered;
  }
  struct Manufacturer {
    address manufacturerAddress;
    string name;
    bool isRegistered;
  }
  struct GeneralPublic {
    address publicAddress;
    string name;
    bool isRegistered;
  }

  mapping(address => Vendor) public vendors;
  mapping(address => Contractor) public contractors;
  mapping(address => GovernmentAgency) public governmentAgencies;
  mapping(address => Manufacturer) public manufacturers;
  mapping(address => GeneralPublic) public generalPublic;
  mapping(uint256 => Order) public orders;
  
  uint256 public nextOrderId;


}
