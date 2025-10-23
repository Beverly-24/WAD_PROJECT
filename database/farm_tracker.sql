-- MySQL schema for FarmTracker
CREATE DATABASE IF NOT EXISTS farm_tracker;
USE farm_tracker;

CREATE TABLE IF NOT EXISTS farmers (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
    crop_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT,
    crop_name VARCHAR(50),
    quantity DECIMAL(10,2),
    harvest_date DATE,
    price_per_kg DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS livestock (
    livestock_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT,
    animal_type VARCHAR(50),
    count INT,
    price_per_animal DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS buyers (
    buyer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT,
    item_type ENUM('crop','livestock'),
    item_id INT,
    quantity DECIMAL(10,2),
    total_price DECIMAL(12,2),
    transaction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(buyer_id) ON DELETE SET NULL
);

-- Sample data
INSERT INTO farmers (name, email, phone) VALUES
('John Doe','john@example.com','+264811111111'),
('Mary Farmer','mary@example.com','+264822222222');

INSERT INTO crops (farmer_id, crop_name, quantity, harvest_date, price_per_kg) VALUES
(1,'Maize',500.00,'2025-03-15',5.50),
(2,'Mahangu',300.00,'2025-04-10',4.00);

INSERT INTO livestock (farmer_id, animal_type, count, price_per_animal) VALUES
(1,'Cattle',12,1200.00),
(2,'Goat',25,150.00);

INSERT INTO buyers (name,email,phone) VALUES
('AgriBuyer','buyer@example.com','+264833333333');
