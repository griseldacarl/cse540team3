// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract BusinessRegistry {
    //Admin role for gov official
    address admin;

    // Data structure for the business
    // Optionally add things like verified status
    struct Business {
        string name;
        string id;
    }

    //Store mapping of wallet->business
    mapping (address => Business) public businesses;


    //Register a business with their wallet, name, and business id.
    // Gov official only, gov works with business and its own records to get information.
    // This function should add the business into the mapping
    function registerBusiness(address wallet, string memory name, string memory id) public returns (bool) {

    }

    // Update an already-registered business' wallet.
    // Gov official only. Would be coordinated between gov and business
    function updateBusinessWallet(address oldWallet, address newWallet) public {}

    // Anyone can call this, including public. Read only, doesn't update data.
    // Returns the business struct associated with the wallet
    function getBusinessByAddress(address wallet) public view returns (Business memory){}

    // Get all businesses? For the sake of public transparency.
    // Unsure if necessary. Returns list of all business structs registered
    function getAllBusinesses() public view returns (Business[] memory) {}
}
