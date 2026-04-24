import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Contract config
import { orderFactoryAddress } from "../GovernmentABI/orderFactoryAddress";
import { orderFactoryABI } from "../GovernmentABI/orderFactoryABI";
import { businessRegistryAddress } from "../GovernmentABI/businessRegistryAddress";
import { businessRegistryABI } from "../GovernmentABI/businessRegistryABI";

import ContractsPage from "./ContractsPage";
import BusinessRegistry from "./BusinessRegistry";

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
  Legend
);

const drawerWidth = 240;

function Main() {
  // =========================
  // WALLET / BASIC STATE
  // =========================
  const [walletAddress, setWalletAddress] = useState("");
  const [orderAddresses, setOrderAddresses] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Not connected");
  const [networkInfo, setNetworkInfo] = useState("");

  const [businessData, setBusinessData] = useState([]);
  const [dbStatus, setDbStatus] = useState("");

  const [walletColor, setwalletColor] = useState("Red");
  const [blockColor, setblockColor] = useState("Red");
  const [dbColor, setDbColor] = useState("Red");

  const [selectedIndex, setSelectedIndex] = useState(3);

  const [uniqueBusinesses, setUniqueBusinesses] = useState([]);
  const [bizTypeData, setBizTypeData] = useState(null);
  const [approveBizData, setBizApproveData] = useState(null);

  // =========================
  // ORDER DETAIL STATE
  // =========================
  const [order, setOrder] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // =========================
  // CONTRACT STATE (ADDED)
  // =========================
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractError, setContractError] = useState("");

  // =========================
  // STARTUP
  // =========================
  useEffect(() => {
    loadConnections();
    loadUniqueBiz();
    loadBizType();
    loadApproved();
    loadContracts();
  }, []);

  // =========================
  // CONNECTION TESTS
  // =========================
  const loadConnections = async () => {
    try {
      await fetch("http://localhost:5001/api/businesses");
      setDbColor("Green");
    } catch {}

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      setwalletColor("Green");

      const network = await provider.getNetwork();
      setNetworkInfo(`${network.name} (${network.chainId})`);
      setblockColor("Green");
    } catch {}
  };

  // =========================
  // CONTRACT LOADER
  // =========================
  const loadContracts = async () => {
    setContractsLoading(true);
    setContractError("");

    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      const factory = new ethers.Contract(
        orderFactoryAddress,
        orderFactoryABI,
        provider
      );

      const addresses = await factory.getAllOrders();

      const data = await Promise.all(
        addresses.map(async (addr, i) => {
          const d = await factory.getOrderDetail(addr);

          return {
            id: `${i}-${addr}`,
            address: addr,
            businessAddress: d[0],
            itemNames: d[1],
            itemPrices: d[2].map((p) => p.toString()),
            itemQuantities: d[3],
            paymentStatus: d[4],
            fulfillmentStatus: d[5],
          };
        })
      );

      setContracts(data);
    } catch (err) {
      console.error(err);
      setContracts([]);
      setContractError("Failed to load contracts");
    } finally {
      setContractsLoading(false);
    }
  };

  // =========================
  // CONTRACT STATS
  // =========================
  const getContractStats = () => {
    if (!contracts.length) return null;

    let paid = 0;
    let unpaid = 0;
    let fulfilled = 0;
    let pending = 0;

    contracts.forEach((c) => {
      c.paymentStatus ? paid++ : unpaid++;
      c.fulfillmentStatus ? fulfilled++ : pending++;
    });

    return {
      total: contracts.length,
      paid,
      unpaid,
      fulfilled,
      pending,
    };
  };

  const contractStats = getContractStats();

  const contractPaymentData = contractStats && {
    labels: ["Paid", "Unpaid"],
    datasets: [
      {
        data: [contractStats.paid, contractStats.unpaid],
        backgroundColor: ["rgba(75,192,192,0.2)", "rgba(255,99,132,0.2)"],
        borderColor: ["rgba(75,192,192,1)", "rgba(255,99,132,1)"],
        borderWidth: 1,
      },
    ],
  };

  const contractFulfillmentData = contractStats && {
    labels: ["Fulfilled", "Pending"],
    datasets: [
      {
        data: [contractStats.fulfilled, contractStats.pending],
        backgroundColor: ["rgba(54,162,235,0.2)", "rgba(255,206,86,0.2)"],
        borderColor: ["rgba(54,162,235,1)", "rgba(255,206,86,1)"],
        borderWidth: 1,
      },
    ],
  };

  // =========================
  // BUSINESS LOADERS
  // =========================
  const loadUniqueBiz = async () => {
    const res = await fetch("http://localhost:5001/api/businesses");
    const data = await res.json();

    const seen = new Set();
    const unique = data.filter((b) => {
      if (seen.has(b.business_name)) return false;
      seen.add(b.business_name);
      return true;
    });

    setUniqueBusinesses(unique);
  };

  const loadBizType = async () => {
    const res = await fetch("http://localhost:5001/api/businesses");
    const data = await res.json();

    const counts = {};
    data.forEach((b) => {
      counts[b.business_type] = (counts[b.business_type] || 0) + 1;
    });

    setBizTypeData({
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts) }],
    });
  };

  const loadApproved = async () => {
    const res = await fetch("http://localhost:5001/api/businesses");
    const data = await res.json();

    const counts = { Approved: 0, Pending: 0 };

    data.forEach((b) => {
      b.is_approved ? counts.Approved++ : counts.Pending++;
    });

    setBizApproveData({
      labels: ["Approved", "Pending"],
      datasets: [{ data: [counts.Approved, counts.Pending] }],
    });
  };

  const handleListSelectedClick = (index) => {
    setSelectedIndex(index);
  };

  // =========================
  // UI
  // =========================
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" sx={{ width: drawerWidth }}>
        <List>
          {["Business Registry", "Contracts", "Stats", "Debug"].map(
            (text, i) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  selected={selectedIndex === i}
                  onClick={() => handleListSelectedClick(i)}
                >
                  <ListItemIcon>
                    {i === 0 ? (
                      <BusinessIcon />
                    ) : i === 1 ? (
                      <DescriptionIcon />
                    ) : i === 2 ? (
                      <TrendingUpIcon />
                    ) : (
                      <SettingsIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </Drawer>

      {/* ================= CONTRACT + BUSINESS STATS (COMBINED) ================= */}
      {selectedIndex === 2 && (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <h1>Stats</h1>

          {/* ===== CONTRACT STATS ===== */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography fontWeight="bold">Contract Overview</Typography>

            {contractsLoading ? (
              <p>Loading...</p>
            ) : contractError ? (
              <p>{contractError}</p>
            ) : contractStats ? (
              <>
                <p>Total Contracts: {contractStats.total}</p>
                <p>Paid: {contractStats.paid}</p>
                <p>Unpaid: {contractStats.unpaid}</p>
                <p>Fulfilled: {contractStats.fulfilled}</p>
                <p>Pending: {contractStats.pending}</p>
              </>
            ) : (
              <p>No contract data</p>
            )}
          </Card>

          <Card sx={{ p: 2, mb: 3 }}>
            <Typography fontWeight="bold">Contract Payment Status</Typography>
            <div style={{ width: 500, height: 500 }}>
              {contractPaymentData && <Pie data={contractPaymentData} />}
            </div>
          </Card>

          <Card sx={{ p: 2, mb: 3 }}>
            <Typography fontWeight="bold">
              Contract Fulfillment Status
            </Typography>
            <div style={{ width: 500, height: 500 }}>
              {contractFulfillmentData && (
                <Bar data={contractFulfillmentData} />
              )}
            </div>
          </Card>

          {/* ===== BUSINESS STATS ===== */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography fontWeight="bold">All Unique Businesses</Typography>
            <ul>
              {uniqueBusinesses.map((b, i) => (
                <li key={i}>
                  (ID: {b.id}) {b.business_name}
                </li>
              ))}
            </ul>
          </Card>

          <Card sx={{ p: 2, mb: 3 }}>
            <Typography fontWeight="bold">Business Types</Typography>
            <div style={{ width: 500, height: 500 }}>
              {bizTypeData && <Pie data={bizTypeData} />}
            </div>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography fontWeight="bold">
              Approved vs Pending Businesses
            </Typography>
            <div style={{ width: 500, height: 500 }}>
              {approveBizData && (
                <Bar
                  data={approveBizData}
                  options={{
                    plugins: { legend: { display: false } },
                  }}
                />
              )}
            </div>
          </Card>
        </Box>
      )}

      {selectedIndex === 1 && <ContractsPage />}
      {selectedIndex === 0 && <BusinessRegistry />}
    </Box>
  );
}

export default Main;