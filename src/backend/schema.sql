DROP DATABASE IF EXISTS government_supply_chain;
CREATE DATABASE IF NOT EXISTS government_supply_chain;

USE government_supply_chain;

CREATE TABLE businesses (
    id VARCHAR(100) PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL UNIQUE,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    business_type VARCHAR(100),
    contact_email VARCHAR(255),
    phone_number VARCHAR(50),
    street_address VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO businesses (
    id,
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
    country,
    is_approved
) VALUES
(
    'BIZ-001',
    '0x1111111111111111111111111111111111111111',
    'Rocky Mountain Office Supply',
    'REG-1001',
    'Office Supplies',
    'contact@rockymountainoffice.com',
    '719-555-0101',
    '123 Pikes Peak Ave',
    'Colorado Springs',
    'CO',
    '80903',
    'USA',
    TRUE
),
(
    'BIZ-002',
    '0x2222222222222222222222222222222222222222',
    'Front Range Tech Solutions',
    'REG-1002',
    'Technology Services',
    'info@frongetech.com',
    '719-555-0102',
    '456 Garden of the Gods Rd',
    'Colorado Springs',
    'CO',
    '80907',
    'USA',
    TRUE
),
(
    'BIZ-003',
    '0x3333333333333333333333333333333333333333',
    'Pikes Peak Construction Group',
    'REG-1003',
    'Construction',
    'admin@ppconstruction.com',
    '719-555-0103',
    '789 Academy Blvd',
    'Colorado Springs',
    'CO',
    '80909',
    'USA',
    FALSE
);
