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
    // Store mapping of name->wallet
    mapping(string => address) private nameToWallet;
    // Store mapping of id->wallet
    mapping(string => address) private idToWallet;

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
        require(nameToWallet[name] == address(0), "Business name already registered");
        require(idToWallet[id] == address(0), "Business ID already registered");

        // check fields are not empty
        require(bytes(name).length > 0, "Business name required");
        require(bytes(id).length > 0, "Business ID required");

        // Create a new business struct and add it to the mapping
        businesses[wallet] = Business(name, id);

        nameToWallet[name] = wallet;
        idToWallet[id] = wallet;

        emit BusinessRegistered(wallet, name, id);
        return true;
    }

    /*
    * Update the wallet address of a registered business
    * Access: Admin only
    * Parameters: oldWallet, newWallet
    * Returns: None
    *
    * Moves the business record to a new wallet and updates all reverse
    * lookup mappings so the registry remains consistent.
    */
    function updateBusinessWallet(address oldWallet, address newWallet) public onlyAdmin {
        require(oldWallet != address(0), "Invalid old wallet");
        require(newWallet != address(0), "Invalid new wallet");
        require(bytes(businesses[oldWallet].name).length > 0, "Old wallet not registered");
        require(bytes(businesses[newWallet].name).length == 0, "New wallet already registered");

        // Copy business data into memory before deleting the old mapping entry
        Business memory business = businesses[oldWallet];

        delete businesses[oldWallet];
        businesses[newWallet] = business;

        // Update reverse lookup mappings to point to the new wallet
        nameToWallet[business.name] = newWallet;
        idToWallet[business.id] = newWallet;

        emit BusinessWalletUpdated(oldWallet, newWallet, business.name, business.id);
    }

    
    /* 
     * Get the business struct by wallet address
     * Access: Public
     * Parameters: wallet
     * Returns: Related business struct
     */
    function getBusinessByAddress(address wallet) public view returns (Business memory){
        require(wallet != address(0), "Business not found");
        return businesses[wallet];
    }
    
    /*
    * Get the wallet address associated with a business name
    * Access: Public
    * Parameters: name
    * Returns: The wallet address of the matching business
    */
    function getBusinessByName(string memory name) public view returns (address wallet) {
        address wallet = nameToWallet[name];
        require(wallet != address(0), "Business not found");
        return wallet;
    }

    /*
    * Get the wallet address associated with a business ID
    * Access: Public
    * Parameters: id
    * Returns: The wallet address of the matching business
    */
    function getBusinessById(string memory id) public view returns (address wallet) {
        address wallet = idToWallet[id];
        require(wallet != address(0), "Business not found");
        return wallet;
    }

    /*
    * Check whether a business name is already registered
    * Access: Public
    * Parameters: businessName
    * Returns: True if the business exists, otherwise false
    */
    function businessExists(string memory businessName) public view returns (bool) {
        return nameToWallet[businessName] != address(0);
    }
}
