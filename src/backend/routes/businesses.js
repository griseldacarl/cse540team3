// This file is api to allow the front end to add new businesses
// and get all businesses from the business database.
const express = require("express");
const router = express.Router();
const db = require("../db");

/*
 * This router is the backend's business-data API surface. It provides a read path for the
 * frontend to list stored businesses and a write path for creating new business records in
 * MySQL, acting as the boundary between HTTP requests and the persistence layer for business
 * registration data.
 */

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

/*
 * GET business by database ID
 * Example: /api/businesses/id/3
 */
router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching business by ID:", error);
    res.status(500).json({ error: "Failed to fetch business by ID" });
  }
});

/*
 * GET business by wallet address
 * Example: /api/businesses/wallet/0x3333333333333333333333333333333333333333
 */
router.get("/wallet/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE wallet_address = ?",
      [wallet]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching business by wallet:", error);
    res.status(500).json({ error: "Failed to fetch business by wallet" });
  }
});

/*
 * GET business by business name
 * Example: /api/businesses/name/Pikes%20Peak%20Construction%20Group
 */
router.get("/name/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE business_name = ?",
      [name]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching business by name:", error);
    res.status(500).json({ error: "Failed to fetch business by name" });
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