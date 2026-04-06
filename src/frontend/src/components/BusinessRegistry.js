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
                </Box>
            </Paper>

            <Paper sx={{ p: 3, elevation: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 'bold' }} >Update business wallet address</Typography>
                    <TextField label="Current Wallet Address"></TextField>
                    <TextField label="New Wallet Address"></TextField>
                </Box>
            </Paper>
        </Box>
    )

    function updateWalletAddress(oldAddress, newAddress) {
        // TODO: Update wallet for business logic
    }

    function registerBusiness(name, id, wallet) {
        // TODO: Register business logic
    }

    function searchBusiness(input, byType) {
        // TODO: Search business logic
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
