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
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
function BusinessRegistry() {
    // Use to make admin functions greyed out
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <Box>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <FormControl> 
                <TextField></TextField>
                <InputLabel>Search for a business</InputLabel>
            </FormControl>
            <Typography> by ...</Typography>
            <FormControl>
                <Select native>
                    <option value="name">Name</option>
                    <option value="id">ID</option>
                    <option value="wallet">Wallet</option>
                </Select>
            </FormControl>
            </Box>
            
            <Typography>Register a business</Typography>
            
            <Typography>Update business wallet address</Typography>
        </Box>
    )
}

export default BusinessRegistry;
