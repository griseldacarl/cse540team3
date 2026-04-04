// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;
import "./OrderContract.sol";
contract OrderFactory is OrderBase {

    // Admin address should be the government official in-charge of the project
    address public admin;

    // When an order is created, the address to the order is stored in this array.
    address[] orderContracts;

    // Registry address so we can check businesses from this contract.
    address businessRegistry;

    mapping(address => address[]) private businessOrders;

    event OrderContractCreated(address indexed businessAddress, address orderContractAddress);

    /*
     * Constructor sets the admin address and the businesss registry address
     * Parameters: registryAddress
     * Returns: None
     */
    constructor(address registryAddress) {
        admin = msg.sender; // Set the deployer as the admin
        businessRegistry = registryAddress;
    }

    /* 
     * Creates an order contract and stores its reference. Admin enters info, function validates with registry, if valid - create contract, otherwise fail
     * Access: Admin only
     * Parameters: BusinessAddress, itemNames, itemPrices, itemQuantities
     * Returns: address of new contract
     */
    function createOrderContract(address BusinessAddress,string[] memory itemNames, uint256[] memory itemPrices, string[] memory itemQuantities) public returns (address) {
            require(msg.sender == admin, "Only admin can call this function");
            OrderContract  newContract = new OrderContract(BusinessAddress, itemNames, itemPrices, itemQuantities);
            orderContracts.push(address(newContract));
            emit OrderContractCreated(BusinessAddress, address(newContract));
            return address(newContract);
    }

    /*
     * Returns all order contracts
     * Access: Public
     * Parameters: None
     * Returns: Array of order contract references
     */
    function getAllOrders() public view returns (address[] memory) {
        return orderContracts;
    }
}