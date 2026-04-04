import React, { useState } from "react";
import { orderFactoryAddress } from "../GovernmentABI/orderFactoryAddress";
import { orderFactoryABI } from "../GovernmentABI/orderFactoryABI";
import { businessRegistryABI } from "../GovernmentABI/businessRegistryABI"
import { businessRegistryAddress } from "../GovernmentABI/businessRegistryAddress";
import { ethers } from "ethers";

/*
 * This component is the frontend for the Government Supply Chain app.
 * It connects to MetaMask, reads order data from the deployed smart contract,
 * tests the backend database connection, and displays both blockchain-based
 * order information and database-stored business records in one interface.
 */

function Main() {
  const [walletAddress, setWalletAddress] = useState("");
  const [orderAddresses, setOrderAddresses] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Not connected");
  const [networkInfo, setNetworkInfo] = useState("");
  const [businessData, setBusinessData] = useState(null);
  const [dbStatus, setDbStatus] = useState("");
  // this is for testing order details
  const [order, setOrder] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);


  /*
   * The database helper exercises the backend API and updates the UI with either the returned
   * business records or an error state. This gives the page a quick connectivity check for the
   * MySQL-backed portion of the project without mixing that logic into the blockchain flow.
   */
  const loadBusinesses = async () => {
    try {
      setDbStatus("Checking database...");
      const response = await fetch("http://localhost:5001/api/businesses");
      console.log("Response from database: ", response);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("Businesses:", data);
      setBusinessData(data);
      setDbStatus("Database is up! Fetched businesses successfully.");
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setDbStatus(`Database test failed: ${error.message}`);
      setBusinessData(null);
    }
  };

  const loadBusinessByWallet = async (walletAddress) => {
    try {
      const response = await fetch(`http://localhost:5001/api/businesses/wallet/${walletAddress}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log("Business by wallet:", data);

      setSelectedBusiness(data);   // <-- important
      return data;
    } catch (error) {
      console.error("Failed to load business by wallet:", error);
      setSelectedBusiness(null);
      return null;
    }
  };

  /*
   * The wallet-and-orders helper drives the blockchain side of the app. 
   * It connects the user's wallet, checks the currently selected network and then reads the
   * list of order contract addresses so the UI can present the on-chain order state.
   */
  const connectAndLoadOrders = async () => {
    console.log("window.ethereum =", window.ethereum);

    // check if the browser has MetaMask browser extension
    if (!window.ethereum) {
      console.error("MetaMask is not installed");
      setStatusMessage("MetaMask is not installed. Open in Chrome/Edge with MetaMask.");
      alert("MetaMask is not installed. Open this app in Chrome/Edge and install the MetaMask extension.");
      return;
    }

    try {
      setStatusMessage("Connecting to MetaMask...");

      // Connect wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create provider + signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();

      setWalletAddress(currentWalletAddress);

      console.log("Connected wallet:", currentWalletAddress);
      console.log("OrderFactory address:", orderFactoryAddress);
      console.log("OrderFactory ABI:", orderFactoryABI);

      // 1) Check network
      const network = await provider.getNetwork();
      const networkText = `${network.name} (chainId: ${network.chainId.toString()})`;
      setNetworkInfo(networkText);

      console.log("Network:", network.name);
      console.log("Chain ID:", network.chainId.toString());

      // 2) Check if contract code exists at the address
      const code = await provider.getCode(orderFactoryAddress);
      console.log("Runtime code at OrderFactory address:", code);
      console.log("Runtime code length:", code.length);

      if (code === "0x") {
        setStatusMessage("No contract code found at this address on the current MetaMask network.");
        alert("No contract found at orderFactoryAddress on the selected MetaMask network.");
        return;
      }

      // 3) Make a raw low-level call to getAllOrders()
      const iface = new ethers.Interface(orderFactoryABI);
      const callData = iface.encodeFunctionData("getAllOrders", []);
      console.log("Encoded getAllOrders() call data:", callData);

      const rawResult = await provider.call({
        to: orderFactoryAddress,
        data: callData,
      });

      console.log("Raw eth_call result for getAllOrders():", rawResult);

      if (rawResult === "0x") {
        setStatusMessage("Contract exists, but getAllOrders() returned raw 0x. Function likely missing on deployed bytecode.");
        alert("Contract code exists, but getAllOrders() returned raw 0x. Check that the deployed contract really contains getAllOrders().");
        return;
      }

      // Create contract instance
      const contract = new ethers.Contract(
        orderFactoryAddress,
        orderFactoryABI,
        signer
      );

      // Normal ethers call
      const orders = await contract.getAllOrders();

      console.log("Decoded order contract addresses:", orders);

      if (!orders || orders.length === 0) {
        setOrderAddresses([]);
        setStatusMessage("Connected successfully. No orders found yet.");
        return;
      }

      setOrderAddresses(orders);
      setStatusMessage("Connected and loaded all orders successfully!");
    } catch (error) {
      console.error("Error connecting to MetaMask or reading contract:", error);
      setStatusMessage("Failed to load orders. Check console.");
      alert("Failed to load orders. Check the browser console (F12).");
    }
  };


  /*
   * This is just a function to test current Backend functions
   */
  const testFunction = async () => {

    if (!businessData || businessData.length === 0) {
      alert("No business data loaded. Test Database first.");
      return;
    }

    try {
      setStatusMessage("Testing blockchain function...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();
      setWalletAddress(currentWalletAddress);

      // Contract instance
      const business = businessData[1];
      console.log("Testing:", business.business_name);

      const businessRegistryContract = new ethers.Contract(
        businessRegistryAddress,
        businessRegistryABI,
        signer
      );

      const adminAddress = await businessRegistryContract.admin();
      console.log("Admin wallet:", adminAddress);
      console.log("Using wallet:", currentWalletAddress);
      const exists = await businessRegistryContract.businessExists(business.business_name);

    if (!exists) {
      // Send a transaction to register the business
      const tx = await businessRegistryContract.registerBusiness(
        business.wallet_address,
        business.business_name,
        business.id
      );

      console.log("Transaction sent:", tx.hash);
      await tx.wait(); // wait until mined
      console.log("Business registered successfully!");
    }else{
      console.log(`${business.business_name} is already registered. Skipping.`);
    }
      

      const business1 = await businessRegistryContract.getBusinessByName(business.business_name);
      console.log("Order business addresses:", business1);

      const orderContract = new ethers.Contract(orderFactoryAddress, orderFactoryABI, signer);

      
      if (!orderContract) {
        console.error("orderContract not initialized");
        return;
      }

      // Make sure connected wallet is admin
      if (currentWalletAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        console.error("Connected wallet is NOT admin");
        return;
      }

      const vendorAddress = business.wallet_address;

      const itemNames = [
        "Concrete Mix",
        "Rebar Steel",
        "Site Survey Service"
      ];

      const itemPrices = [
        1500,   // $15.00 or 1500 cents depending on your unit choice
        800,    // $8.00
        25000   // $250.00
      ];

      const itemQuantities = [
        "10 cubic yards",
        "500 linear feet",
        "1 package"
      ];

      console.log("Creating order for vendor:", vendorAddress);

      const tx1 = await orderContract.createOrderContract(
        vendorAddress,
        itemNames,
        itemPrices,
        itemQuantities
      );

      console.log("Transaction sent:", tx1.hash);

      const receipt = await tx1.wait();
      console.log("Transaction mined:", receipt);

      const orders = await orderContract.getAllOrders();
      console.log("Decoded order addresses:", orders);

      setOrderAddresses(orders || []);
      setStatusMessage("Business registered and orders loaded successfully!");

      const ordersForBusiness = await orderContract.getOrdersByBusiness(business.wallet_address);
      console.log("order addresses for a business:", ordersForBusiness);

      const details = await orderContract.getOrderDetail(ordersForBusiness[0]);
      console.log("a order's details for a business:", details);

      const formattedOrder = {
        businessAddress: details[0],
        itemNames: details[1],
        itemPrices: details[2].map((p) => p.toString()),
        itemQuantities: details[3],
        paymentStatus: details[4],
        fulfillmentStatus: details[5],
      };

    setOrder(formattedOrder)

    loadBusinessByWallet(details[0]);
    } catch (err) {
      console.error("Blockchain function error:", err);
      if (err.reason) alert(err.reason);
      else alert(err.message);
      setStatusMessage("Error: Check console for details");
    }
};

  /*
   * The rendered layout groups the app into three user-facing views: connection status,
   * blockchain and backend metadata, and the discovered order list.
   */
  return (
    <div style={styles.container}>
      <h1>Government Supply Chain App</h1>

      <button style={styles.button} onClick={connectAndLoadOrders}>
        Connect Wallet & Load Orders
      </button>

      <button style={{ ...styles.button, marginLeft: "10px" }} onClick={loadBusinesses}>
        Test Database
      </button>

      <button style={{ ...styles.button, marginLeft: "10px" }} onClick={testFunction}>
        Test Function
      </button>

      <div style={styles.card}>
        <h2>Status</h2>
        <p>{statusMessage}</p>
      </div>

      <div style={styles.card}>
        <h2>Connection Info</h2>
        <p><strong>Wallet Address:</strong> {walletAddress || "Not connected"}</p>
        <p><strong>Network:</strong> {networkInfo || "Not connected"}</p>
        <p><strong>OrderFactory Address:</strong> {orderFactoryAddress}</p>
        <p><strong>Total Orders:</strong> {orderAddresses.length}</p>
        
      </div>

      <div style={styles.card}>
        <h2>Database Test</h2>
        <p>{dbStatus || "Click 'Test Database' to check"}</p>
        {businessData && (
          <div>
            <h3>Businesses:</h3>
            <ul>
              {businessData.map((b, i) => (
                <li key={i}>{b.name} (ID: {b.id})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2>Order Details</h2>

        {order ? (
          <>
            <p><strong>Business Address:</strong> {order.businessAddress}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus ? "Paid" : "Unpaid"}</p>
            <p><strong>Fulfillment Status:</strong> {order.fulfillmentStatus ? "Fulfilled" : "Not Fulfilled"}</p>
            <h3>Procurement Vendor Details</h3>
            {selectedBusiness ? (
              <div style={styles.businessBox}>
                <p><strong>Business Name:</strong> {selectedBusiness.business_name}</p>
                <p><strong>Registration #:</strong> {selectedBusiness.registration_number}</p>
                <p><strong>Business Type:</strong> {selectedBusiness.business_type}</p>
                <p><strong>Contact Email:</strong> {selectedBusiness.contact_email}</p>
                <p><strong>Phone:</strong> {selectedBusiness.phone_number}</p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedBusiness.street_address}, {selectedBusiness.city},{" "}
                  {selectedBusiness.state_province} {selectedBusiness.postal_code},{" "}
                  {selectedBusiness.country}
                </p>
              </div>
            ) : (
              <p>No business details loaded for this vendor yet.</p>
            )}
            <h3>Items</h3>
            <ul>
              {order.itemNames.map((name, index) => (
                <li key={index}>
                  {name} — Qty: {order.itemQuantities[index]} — Price: {order.itemPrices[index]}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No order selected</p>
        )}
      </div>

      <h2>All Orders</h2>

      {orderAddresses.length > 0 ? (
        orderAddresses.map((address, index) => (
          <div key={index} style={styles.card}>
            <p><strong>Order #{index + 1}</strong></p>
            <p><strong>Order Contract Address:</strong> {address}</p>
          </div>
        ))
      ) : (
        <div style={styles.card}>
          <p>No orders found yet.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    marginBottom: "20px",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#f9f9f9",
  },
};

export default Main;