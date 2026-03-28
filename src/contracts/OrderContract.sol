// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract OrderBase {
    struct Item {
        string name;
        uint256 price;
        string quantity;
    }
}
// Contract is generated from the contract factory smart contract
contract OrderContract is OrderBase {
    // gov official address
    address admin;

    
    event PaymentStatusUpdated(address indexed businessAddress, bool newStatus);
    event FulfillmentStatusUpdated(address indexed businessAddress, bool newStatus);

  
    //Contract details:
    //Unsure how to keep this synced if we need to update a business address in the registry
    address businessAddress;
    bool paymentStatus;
    bool fulfillmentStatus;
    Item[] order;

    constructor(address _businessAddress,string[] memory itemNames, uint256[] memory itemPrices, string[] memory itemQuantities) {
        admin = msg.sender; // Set the deployer as the admin
        businessAddress = _businessAddress;
        paymentStatus = false;
        fulfillmentStatus = false;
        for (uint i = 0; i < itemNames.length; i++) {
            order.push(Item(itemNames[i], itemPrices[i], itemQuantities[i]));
        }
    }
    // Updated by gov or business?
    // True or false.  Could also be 3-stated as an enum: False, Partial, True
    function updatePaymentStatus(bool newStatus) public {
        paymentStatus = newStatus;
        if (paymentStatus) {
            // Emit an event when payment is marked as paid

            emit PaymentStatusUpdated(businessAddress, newStatus);
        }
    }

    // Updated by gov or business?
    // True or false.  Could also be 3-stated as an enum: False, Partial, True
    function updateFulfillmentStatus(bool newStatus) public {

        fulfillmentStatus = newStatus;
        if (fulfillmentStatus) {
            // Emit an event when payment is marked as paid
            emit FulfillmentStatusUpdated(businessAddress, newStatus);
        }
    }

    //Public access
    // Returns order struct containing order details
    function getOrder() public view returns (Item[] memory) {
      return order;
    }

    //Public access
    // Returns status of payment
    function getPaymentStatus() public view returns (bool) {
        return paymentStatus;
    }

    //Public access
    // returns fulfillment status
    function getFulfillmentStatus() public view returns (bool) {
        return fulfillmentStatus;
    }

}
