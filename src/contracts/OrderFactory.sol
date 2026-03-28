// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;
import "./OrderContract.sol";
contract OrderFactory is OrderBase {

    //Gov official, allowed to spawn order contracts
    address public admin;

    // When an order is created, the address to the order is stored in this array.
    address[] orderContracts;

    //Registry address so we can check businesses from this contract.
    address businessRegistry;

    event OrderContractCreated(address indexed businessAddress, address orderContractAddress);

    constructor(address registryAddress) {
        admin = msg.sender; // Set the deployer as the admin
        businessRegistry = registryAddress;
    }


    // Gov-only
    // Generate the contract on-chain and return it's address into the list of order contracts
    // Flow looks like:
    // 1. Gov official enters information into the function
    // 2. Function checks business registry contract to ensure business is in the registry
    // 3. If yes, create the order contract, store the order contract address in orderContracts
    // 4. If no, process fails
    
    function createOrderContract(address BusinessAddress,string[] memory itemNames, uint256[] memory itemPrices, string[] memory itemQuantities) public returns (address) {
            require(msg.sender == admin, "Only admin can call this function");
            OrderContract  newContract = new OrderContract(BusinessAddress, itemNames, itemPrices, itemQuantities);
            orderContracts.push(address(newContract));
            emit OrderContractCreated(BusinessAddress, address(newContract));
            return address(newContract);
    }

    //public access
    // Return all orders
    // This can be broken into several getter functions for the sake of gas cost.  I.e GetOrdersByBusiness, GetOutstandingOrders, etc
    function getAllOrders() public view returns (address[] memory) {
        return orderContracts;
    }
}