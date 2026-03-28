// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract BusinessRegistry {
    //Admin role for gov official
    address public admin;


    // Data structure for the business
    // Optionally add things like verified status
    struct Business {
        string name;
        string id;
    }

    constructor() {
        admin = msg.sender; // Set the deployer as the admin
    }   

    event BusinessRegistered(address indexed businessAddress, string name, string id);
    event BusinessWalletUpdated(address indexed oldWallet, address indexed newWallet, string name, string id);

    //Store mapping of wallet->business
    mapping (address => Business) public businesses;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    //Register a business with their wallet, name, and business id.
    // Gov official only, gov works with business and its own records to get information.
    // This function should add the business into the mapping
    function registerBusiness(address wallet, string memory name, string memory id) public onlyAdmin returns (bool) {
        // Check if the business is already registered
        require(bytes(businesses[wallet].name).length == 0, "Business already registered");

        // Create a new business struct and add it to the mapping
        businesses[wallet] = Business(name, id);
        emit BusinessRegistered(wallet, name, id);
        return true;
    }

    // Update an already-registered business' wallet.
    // Gov official only. Would be coordinated between gov and business
    function updateBusinessWallet(address oldWallet, address newWallet) public onlyAdmin {
        Business storage business = businesses[oldWallet];
        delete businesses[oldWallet];
        businesses[newWallet] = business;
        emit BusinessWalletUpdated(oldWallet, newWallet, business.name, business.id);
    }

    // Anyone can call this, including public. Read only, doesn't update data.
    // Returns the business struct associated with the wallet
    function getBusinessByAddress(address wallet) public view returns (Business memory){
        return businesses[wallet];
    }

    // Get all businesses? For the sake of public transparency.
    // Unsure if necessary. Returns list of all business structs registered
    function getAllBusinesses() public view returns (Business[] memory) {   }//This would use a lot of gas, so maybe not the best idea. Maybe we can have a separate function that returns the total number of businesses, and then we can have a function that returns a business by index?
}
