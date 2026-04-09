import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Contract config
import { orderFactoryAddress } from "../GovernmentABI/orderFactoryAddress";
import { orderFactoryABI } from "../GovernmentABI/orderFactoryABI";
import { businessRegistryAddress } from "../GovernmentABI/businessRegistryAddress";
import { businessRegistryABI } from "../GovernmentABI/businessRegistryABI";

// MUI components
import {
  Paper,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
} from "@mui/material";

// MUI icons
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CircleIcon from "@mui/icons-material/Circle";

// Local components
import BusinessRegistry from "./BusinessRegistry";

// Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Title,
  Tooltip,
  Legend
);



//How wide the side drawer is
const drawerWidth = 240;

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
  const [businessData, setBusinessData] = useState([]);
  const [dbStatus, setDbStatus] = useState("");
  // this is for testing order details
  const [order, setOrder] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);


  const [walletColor, setwalletColor] = useState("Red");
  const [blockColor, setblockColor] = useState("Red");
  const [dbColor, setDbColor] = useState("Red");
  const [selectedIndex, setSelectedIndex] = useState(3);
  const [uniqueBusinesses, setUniqueBusinesses] = useState([]);
  const [bizTypeData, setBizTypeData] = useState(null)
  const [approveBizData, setBizApproveData] = useState(null)


  //Check statuses on startup
  useEffect(() => {
    loadConnections();
    loadUniqueBiz();
    loadBizType();
    loadApproved();

  }, []);


  const loadConnections = async () => {

    //Test DB Connection
    try{
      const response = await fetch("http://localhost:5001/api/businesses");
      console.log("Response from database: ", response);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setDbColor("Green")
    }
    catch(error){
      console.error("Failed to load businesses:", error);
      setDbStatus(`Database test failed: ${error.message}`);
      setBusinessData(null);
    }

    //Test getting Metamask Wallet
    try{
      // Create provider + signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();
      setwalletColor("Green")
    }
    catch(error){

    }


    //Test BlockChain Network
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const networkText = `${network.name} (chainId: ${network.chainId.toString()})`;
      setNetworkInfo(networkText);
      setblockColor("Green")
    }
    catch(error){

    }

  }



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
      setDbColor("Green")
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setDbStatus(`Database test failed: ${error.message}`);
      setBusinessData(null);
    }
  };

  /*
   * The wallet-and-orders helper drives the blockchain side of the app. 
   * It connects the user's wallet, checks the currently selected network and then reads the
   * list of order contract addresses so the UI can present the on-chain order state.
   */
  const connectwallet = async () => {
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

    } catch (error) {
      console.error("Error connecting to MetaMask or reading contract:", error);

    }
  };

  const LoadOrders = async () => {
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

      const testWalletAddress = "0x1111111111111111111111111111111111111111";

    if (!exists) {
      // Send a transaction to register the business
      const tx = await businessRegistryContract.registerBusiness(
        testWalletAddress,
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

      const vendorAddress = testWalletAddress;

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

      const ordersForBusiness = await orderContract.getOrdersByBusiness(testWalletAddress);
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
    } catch (err) {
      console.error("Blockchain function error:", err);
      if (err.reason) alert(err.reason);
      else alert(err.message);
      setStatusMessage("Error: Check console for details");
    }
  };

  const handleListSelectedClick = (index) => { 
    setSelectedIndex(index)
  }

  const loadUniqueBiz = async () => {
      const response = await fetch("http://localhost:5001/api/businesses");
      console.log("Response from database: ", response);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const seen = new Set();
      const unique = data.filter(element => {
        if (seen.has(element.business_name)) return false;
        seen.add(element.business_name);
        return true;
      });

      setUniqueBusinesses(unique);
  };


  const loadBizType = async () => {
      const response = await fetch("http://localhost:5001/api/businesses");
      console.log("Response from database: ", response);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const jsonData = await response.json();

      const typeCounts = {}
      jsonData.forEach(element =>{
        typeCounts[element.business_type] = (typeCounts[element.business_type] ?? 0) + 1;
      });

      const labels = Object.keys(typeCounts)
      const counts = Object.values(typeCounts)

      const data = {
        labels: labels,
        datasets: [
          {
            label: '# of biz type',
            data: counts,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      setBizTypeData(data)
  };

  const loadApproved = async () => {
      const response = await fetch("http://localhost:5001/api/businesses");
      console.log("Response from database: ", response);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const jsonData = await response.json();

      const typeCounts = {}
      jsonData.forEach(element =>{
        typeCounts[element.is_approved] = (typeCounts[element.is_approved] ?? 0) + 1;
      });

      const labels = ["Not Approved", "Approved"]
      
      const counts = Object.values(typeCounts)

        const data = {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: [
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      setBizApproveData(data)
  };


  /*
   * The rendered layout groups the app into three user-facing views: connection status,
   * blockchain and backend metadata, and the discovered order list.
   */
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Divider sx ={{ my: 2, width: '80%', alignSelf: 'center'}} />
          <List>
            {['Business Registry', 'Contracts', 'Stats', 'Debug'].map((text, index) => (
              <ListItem key={text} disablePadding>
              <ListItemButton
                selected={selectedIndex === index}
                onClick={() => handleListSelectedClick(index)}
              >
                  <ListItemIcon>
                    {index === 0 ? <BusinessIcon /> : index === 1 ? <DescriptionIcon /> : index === 2 ? <TrendingUpIcon />  : <SettingsIcon/>}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ flexGrow: 1 }} />
          <Divider sx ={{ my: 2, width: '80%', alignSelf: 'center'}} />

          <Box sx = {{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}> 
            <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.3}}>
              Connection Status
            </Typography>
            
            <Box sx = {{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1}}> 
              <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.3}}>
                <CircleIcon sx={{ color: walletColor}}/>
                Wallet
              </Typography>
              
              <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.3}}>
                <CircleIcon  sx={{ color: blockColor}}/>
                BlockChain
              </Typography>

              <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.3}}>
                <CircleIcon  sx={{ color: dbColor}}/>
                DataBase
              </Typography>
            </Box>
          </Box>

      </Drawer>

      {selectedIndex === 0 &&
        <BusinessRegistry></BusinessRegistry>
      }

     {selectedIndex === 1 &&
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <h1>Contracts</h1>
        </Box>
      
      }
    

      {selectedIndex === 2 &&
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <h1>Stats</h1>

          <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, p: 3 }}>
              <Card sx={{ width: 500 }}>
                <Typography sx={{margin: 'center', fontWeight: 'bold'}}>
                  All Unique Buisnesses
                </Typography>
                <ul>
                  {uniqueBusinesses.map((b, i) => (
                    <li key={i}> (ID: {b.id}) {b.business_name}</li>
                  ))}
                </ul>
              </Card>
              </Box>
              <Box sx={{ flexGrow: 1, p: 3 }}>
              <Card>
                <Typography sx={{margin: 'center', fontWeight: 'bold'}}>
                  Buisness Types
                </Typography>
                <div style={{ width: '500px', height: '500px', position: 'center' }}>
                  {bizTypeData && <Pie data={bizTypeData}/>}
                </div>
              </Card>
              </Box>
              <Box sx={{ flexGrow: 1, p: 3 }}>
                <Card>
                <Typography sx={{margin: 'center', fontWeight: 'bold'}}>
                  Approved vs Pending Count
                </Typography>
                <div style={{ width: '500px', height: '500px', position: 'center' }}>
                  {approveBizData && <Bar data={approveBizData} options={{ plugins: { legend: { display: false } } }} />}
                </div>
              </Card>
            </Box>
          </Box>
        </Box>
      }
    
      {selectedIndex === 3 &&
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

        <h1>Government Supply Chain App</h1>

        <button style={styles.button} onClick={connectwallet}>
          Connect Wallet
        </button>

        <button style={{ ...styles.button, marginLeft: "10px" }}  onClick={LoadOrders}>
          Load Orders
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
        </Box>
      }

    </Box>
  );
}

const styles = {
  container: {
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