-- ============================================================
-- TXT2SQL Demo Database Schema
-- MySQL 9.1
-- ============================================================

CREATE DATABASE IF NOT EXISTS txt2sql_demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE txt2sql_demo;

-- --------------------------------------------------------
-- employees
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(50)        NOT NULL,
  last_name   VARCHAR(50)        NOT NULL,
  email       VARCHAR(100)       NOT NULL UNIQUE,
  department  VARCHAR(50)        NOT NULL,
  job_title   VARCHAR(80)        NOT NULL,
  salary      DECIMAL(10,2)      NOT NULL,
  hire_date   DATE               NOT NULL,
  is_active   TINYINT(1)         NOT NULL DEFAULT 1,
  created_at  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_salary     (salary)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- departments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  budget      DECIMAL(15,2) NOT NULL,
  manager_id  INT UNSIGNED,
  location    VARCHAR(100),
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- products
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)   NOT NULL,
  category     VARCHAR(60)    NOT NULL,
  price        DECIMAL(10,2)  NOT NULL,
  stock_qty    INT            NOT NULL DEFAULT 0,
  supplier     VARCHAR(100),
  is_available TINYINT(1)     NOT NULL DEFAULT 1,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_price    (price)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT UNSIGNED   NOT NULL,
  product_id   INT UNSIGNED   NOT NULL,
  quantity     INT            NOT NULL DEFAULT 1,
  total_price  DECIMAL(10,2)  NOT NULL,
  status       ENUM('pending','processing','shipped','delivered','cancelled')
               NOT NULL DEFAULT 'pending',
  order_date   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status     (status),
  INDEX idx_order_date (order_date)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- customers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100)   NOT NULL,
  email       VARCHAR(100)   NOT NULL UNIQUE,
  city        VARCHAR(80),
  country     VARCHAR(60)    NOT NULL DEFAULT 'US',
  joined_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_country (country)
) ENGINE=InnoDB;
