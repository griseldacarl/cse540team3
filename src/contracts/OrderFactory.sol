// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;
contract OrderFactory {

    //Gov official, allowed to spawn order contracts
    address admin;

    // When an order is created, the address to the order is stored in this array.
    address[] orderContracts;

    //Registry address so we can check businesses from this contract.
    address businessRegistry;

    constructor(address registryAddress) {

    }
    // Gov-only
    // Generate the contract on-chain and return it's address into the list of order contracts
    // Flow looks like:
    // 1. Gov official enters information into the function
    // 2. Function checks business registry contract to ensure business is in the registry
    // 3. If yes, create the order contract, store the order contract address in orderContracts
    // 4. If no, process fails
    
    function createOrderContract(/*need params*/ ) public view returns (address) {

    }

    //public access
    // Return all orders
    // This can be broken into several getter functions for the sake of gas cost.  I.e GetOrdersByBusiness, GetOutstandingOrders, etc
    function getAllOrders() public view returns (address[] memory) {
        return orderContracts;
    }
}