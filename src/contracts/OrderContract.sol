// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Contract is generated from the contract factory smart contract
contract OrderContract {
    // gov official address
    address admin;

    //Unsure how to keep this synced if we need to update a business address in the registry
    address businessAddress;

    struct Business {
        string name;
        string id;
    }

    struct Item {
        string name;
        uint256 price;
        string quantity;
    }

    //Contract details:
    // Array of Items?
    bool paymentStatus;
    bool fulfillmentStatus;
    Item[] order;

    // Updated by gov or business?
    // True or false.  Could also be 3-stated as an enum: False, Partial, True
    function updatePaymentStatus(bool newStatus) public {

    }

    // Updated by gov or business?
    // True or false.  Could also be 3-stated as an enum: False, Partial, True
    function updateFulfillmentStatus(bool newStatus) public {

    }

    //Public access
    // Returns order struct containing order details
    function getOrder() public view returns (Item memory) {

    }

    //Public access
    // Returns status of payment
    function getPaymentStatus() public view returns (bool) {

    }

    //Public access
    // returns fulfillment status
    function getFulfillmentStatus() public view returns (bool) {

    }

}
