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
    // Admin address will be the wallet for the government official in-charge
    address admin;

    event PaymentStatusUpdated(address indexed businessAddress, bool newStatus);
    event FulfillmentStatusUpdated(address indexed businessAddress, bool newStatus);

    address businessAddress;
    bool paymentStatus;
    bool fulfillmentStatus;
    Item[] order;


    /*
     * Constructor sets the admin address, business address, and all relevant order details.
     * Parameters: _businessAddress, itemNames, itemPrices, itemQuantities
     * Returns: None
     */
    constructor(address _businessAddress,string[] memory itemNames, uint256[] memory itemPrices, string[] memory itemQuantities) {
        admin = msg.sender; // Set the deployer as the admin
        businessAddress = _businessAddress;
        paymentStatus = false;
        fulfillmentStatus = false;
        for (uint i = 0; i < itemNames.length; i++) {
            order.push(Item(itemNames[i], itemPrices[i], itemQuantities[i]));
        }
    }

    /*
     * Updates the payment status of the order
     * Access: Admin and/or business only
     * Parameters: newStatus
     * Returns: None
     */
    function updatePaymentStatus(bool newStatus) public {
        paymentStatus = newStatus;
        if (paymentStatus) {
            // Emit an event when payment is marked as paid

            emit PaymentStatusUpdated(businessAddress, newStatus);
        }
    }

    /*
     * Updates the fulfillment status of the order
     * Access: Admin and/or business only
     * Parameters: newStatus
     * Returns: None
     */
    function updateFulfillmentStatus(bool newStatus) public {

        fulfillmentStatus = newStatus;
        if (fulfillmentStatus) {
            // Emit an event when payment is marked as paid
            emit FulfillmentStatusUpdated(businessAddress, newStatus);
        }
    }

    /*
     * Get the details of the order
     * Access: Public
     * Parameters: None
     * Returns: Array of all items in the order
     */
    function getOrder() public view returns (Item[] memory) {
      return order;
    }

    /* 
     * Get the payment status of the order
     * Access: Public
     * Parameters: None
     * Returns: bool of order payment status
     */ 
    function getPaymentStatus() public view returns (bool) {
        return paymentStatus;
    }

    /*
     * Get the fulfillment status of the order
     * Access: Public
     * Parameters: None
     * Returns: bool of order fulfillment status
     */
    function getFulfillmentStatus() public view returns (bool) {
        return fulfillmentStatus;
    }

}
