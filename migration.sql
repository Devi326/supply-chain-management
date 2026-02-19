-- Migration: Add tx_hash column to sales table for blockchain transaction hash storage
-- Run this against your existing inventory_system database

ALTER TABLE `sales` ADD COLUMN `tx_hash` VARCHAR(66) DEFAULT NULL COMMENT 'Ethereum transaction hash';
