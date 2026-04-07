import React from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';

// abi imports
import { businessRegistryAddress } from '../GovernmentABI/businessRegistryAddress';
import { businessRegistryABI } from '../GovernmentABI/businessRegistryABI';

// mui imports
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
function BusinessRegistry() {
    // Use to make admin functions greyed out
    const [isAdmin, setIsAdmin] = useState(false);

    const [searchParam, setSearchParam] = useState("");
    const [searchBy, setSearchBy] = useState("name");
    const [searchResults, setSearchResults] = useState(null);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
            <Paper sx={{ p: 3, elevation: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Business Registry</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                        <FormControl>
                            <TextField label="Search for a business"></TextField>
                        </FormControl>
                        <Typography> by ...</Typography>
                        <FormControl>
                            <Select native>
                                <option value="name">Name</option>
                                <option value="id">ID</option>
                                <option value="wallet">Wallet</option>
                            </Select>
                        </FormControl>
                        <Button variant="contained">Search</Button>
                    </Box>
                    <BusinessCard></BusinessCard>
                </Box>

            </Paper>

            <Paper sx={{ p: 3, elevation: 6 }}>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Register a business</Typography>
                    <TextField label="Business Name"></TextField>
                    <TextField label="Business ID"></TextField>
                    <TextField label="Wallet Address"></TextField>
                    <Button variant='contained' sx={{ width: '25%' }}>Register</Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, elevation: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 'bold' }} >Update business wallet address</Typography>
                    <TextField label="Current Wallet Address"></TextField>
                    <TextField label="New Wallet Address"></TextField>
                    <Button variant='contained' sx={{ width: '25%' }}>Update address</Button>
                </Box>
            </Paper>
        </Box>
    )

    async function updateWalletAddress(oldAddress, newAddress) {
        // TODO: Update wallet for business logic

        // Verify that the old address matches a current business.
        try {
            // Query DB for business with wallet
        }
        catch (error) {
            // If no business found, return error.
            return "Failed";
        }
        // Update the business wallet in DB.

        // Upon success, update the blockchain.

        // Some indicator of success in the UI.  
    }

    async function registerBusiness(name, id, wallet) {
        // TODO: Register business logic

        // Add to database.

        // Upon success, add to blockchain.

        // Some indicator of success in the UI.  

    }
    // router.get("/wallet/:wallet"
    // router.get("/id/:id"
    // router.get("/name/:name"
    async function searchBusiness(input, byType) {
        // TODO: Search business logic
        try {
            let result;
            switch (byType) {
                case 'name':
                    // Either query DB or use blockchain function
                    result = await fetch("http://localhost:5001/api/businesses/name/" + input);
                    break;
                case 'id':
                    // Either query DB or use blockchain function
                    result = await fetch("http://localhost:5001/api/businesses/id/" + input);
                    break;
                case 'wallet':
                    // Either query DB or use blockchain function
                    result = await fetch("http://localhost:5001/api/businesses/wallet/" + input);
                    break;
                default:
                    break;
            }

            if (result.ok) {
                const data = await result.json();
                console.log("Data:", data);
                return data;
            }
            else {
                return "Failed";
            }
        }
        catch (error) {
            console.error("Error:", error);
            return "Failed";
        }
    } 
}

    function BusinessCard(props) {
        return (
            <Card sx={{ display: 'flex', width: 350, height: 150, flexDirection: 'column', gap: 2, flexGrow: 1, padding: 2 }}>
                <Typography>Name: Meow Meow Clinic</Typography>
                <Typography>ID: 239823892823</Typography>
                <Typography>Wallet: 0x9238238932893289239392</Typography>
            </Card>
        )
    }

    export default BusinessRegistry;
