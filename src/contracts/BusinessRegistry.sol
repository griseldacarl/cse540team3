// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract BusinessRegistry {
    // Admin address will be the wallet for the government official
    address public admin;


    // Business identifiable information
    struct Business {
        string name;
        string id;
    }

    /* 
     * Constructor sets the admin address for the government official
     * Parameters: None
     * Returns: None
     */
    constructor() {
        admin = msg.sender; // Set the deployer as the admin
    }   

    event BusinessRegistered(address indexed businessAddress, string name, string id);
    event BusinessWalletUpdated(address indexed oldWallet, address indexed newWallet, string name, string id);

    // Store mapping of wallet->business
    mapping (address => Business) public businesses;

    /*
     * Restrict access to functions to only the government admin
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /*
     * Register a buiness with their wallet, name and id
     * Access: Admin only
     * Parameters: wallet, name, id
     * Returns: bool of success/failure
     */
    function registerBusiness(address wallet, string memory name, string memory id) public onlyAdmin returns (bool) {
        // Check if the business is already registered
        require(bytes(businesses[wallet].name).length == 0, "Business already registered");

        // Create a new business struct and add it to the mapping
        businesses[wallet] = Business(name, id);
        emit BusinessRegistered(wallet, name, id);
        return true;
    }

    
    /*
     * Update the wallet of a registered
     * Access: Admin only
     * Parameters: oldWallet, newWallet
     * Returns: None
     */
    function updateBusinessWallet(address oldWallet, address newWallet) public onlyAdmin {
        Business storage business = businesses[oldWallet];
        delete businesses[oldWallet];
        businesses[newWallet] = business;
        emit BusinessWalletUpdated(oldWallet, newWallet, business.name, business.id);
    }

    
    /* 
     * Get the business struct by wallet address
     * Access: Public
     * Parameters: wallet
     * Returns: Related business struct
     */
    function getBusinessByAddress(address wallet) public view returns (Business memory){
        return businesses[wallet];
    }
    
    //This would use a lot of gas, so maybe not the best approach. Maybe we can have a separate function that returns the total number of businesses, and then we can have a function that returns a business by index?
    /*
     * Get all businesses
     * Access: Public
     * Parameters: None
     * Returns: Array of all businesses
     */
    function getAllBusinesses() public view returns (Business[] memory) {   }
}
