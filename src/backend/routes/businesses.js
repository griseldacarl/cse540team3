// This file is api to allow the front end to add new businesses
// and get all businesses from the business database.
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all businesses
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM businesses");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

// POST new business
router.post("/", async (req, res) => {
  try {
    const {
      wallet_address,
      business_name,
      registration_number,
      business_type,
      contact_email,
      phone_number,
      street_address,
      city,
      state_province,
      postal_code,
      country
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO businesses
      (wallet_address, business_name, registration_number, business_type, contact_email, phone_number, street_address, city, state_province, postal_code, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wallet_address,
        business_name,
        registration_number,
        business_type,
        contact_email,
        phone_number,
        street_address,
        city,
        state_province,
        postal_code,
        country
      ]
    );

    res.status(201).json({
      message: "Business created successfully",
      businessId: result.insertId
    });
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
});

module.exports = router;