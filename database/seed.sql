-- ============================================================
-- TXT2SQL Seed Data
-- ============================================================

USE txt2sql_demo;

-- Departments
INSERT INTO departments (name, budget, location) VALUES
  ('Engineering',  1500000.00, 'New York'),
  ('Marketing',     800000.00, 'Chicago'),
  ('Sales',        1200000.00, 'Los Angeles'),
  ('HR',            400000.00, 'New York'),
  ('Finance',       600000.00, 'Boston'),
  ('Product',       900000.00, 'San Francisco');

-- Employees
INSERT INTO employees (first_name, last_name, email, department, job_title, salary, hire_date) VALUES
  ('Alice',   'Johnson',  'alice.johnson@company.com',  'Engineering', 'Senior Software Engineer', 120000.00, '2020-03-15'),
  ('Bob',     'Smith',    'bob.smith@company.com',      'Engineering', 'Backend Developer',        95000.00,  '2021-07-01'),
  ('Carol',   'White',    'carol.white@company.com',    'Marketing',   'Marketing Manager',        88000.00,  '2019-11-20'),
  ('David',   'Brown',    'david.brown@company.com',    'Sales',       'Sales Executive',          75000.00,  '2022-01-10'),
  ('Eva',     'Davis',    'eva.davis@company.com',      'HR',          'HR Specialist',            65000.00,  '2021-05-18'),
  ('Frank',   'Miller',   'frank.miller@company.com',   'Finance',     'Financial Analyst',        82000.00,  '2020-09-01'),
  ('Grace',   'Wilson',   'grace.wilson@company.com',   'Engineering', 'Frontend Developer',       92000.00,  '2022-04-25'),
  ('Henry',   'Moore',    'henry.moore@company.com',    'Product',     'Product Manager',         115000.00,  '2018-06-12'),
  ('Isla',    'Taylor',   'isla.taylor@company.com',    'Sales',       'Sales Manager',           105000.00,  '2017-02-28'),
  ('Jack',    'Anderson', 'jack.anderson@company.com',  'Engineering', 'DevOps Engineer',          98000.00,  '2023-01-05'),
  ('Karen',   'Thomas',   'karen.thomas@company.com',   'Marketing',   'Content Strategist',       72000.00,  '2021-08-15'),
  ('Leo',     'Jackson',  'leo.jackson@company.com',    'Finance',     'CFO',                     210000.00,  '2015-04-01'),
  ('Mia',     'Harris',   'mia.harris@company.com',     'Engineering', 'Data Scientist',          130000.00,  '2022-09-19'),
  ('Noah',    'Martin',   'noah.martin@company.com',    'Sales',       'Account Executive',        68000.00,  '2023-03-07'),
  ('Olivia',  'Garcia',   'olivia.garcia@company.com',  'Product',     'UX Designer',              87000.00,  '2020-12-01');

-- Customers
INSERT INTO customers (full_name, email, city, country) VALUES
  ('James Carter',    'james.carter@email.com',   'New York',     'US'),
  ('Sophia Lee',      'sophia.lee@email.com',     'London',       'UK'),
  ('Liam Patel',      'liam.patel@email.com',     'Toronto',      'CA'),
  ('Emma Gonzalez',   'emma.gonzalez@email.com',  'Miami',        'US'),
  ('Oliver Zhang',    'oliver.zhang@email.com',   'Sydney',       'AU'),
  ('Ava Müller',      'ava.muller@email.com',     'Berlin',       'DE'),
  ('William Kim',     'william.kim@email.com',    'Seoul',        'KR'),
  ('Isabella Roy',    'isabella.roy@email.com',   'Paris',        'FR'),
  ('Ethan Nguyen',    'ethan.nguyen@email.com',   'Houston',      'US'),
  ('Charlotte Singh', 'charlotte.singh@email.com','Mumbai',       'IN');

-- Products
INSERT INTO products (name, category, price, stock_qty, supplier) VALUES
  ('Laptop Pro 15"',       'Electronics',   1299.99,  45, 'TechSupply Co.'),
  ('Wireless Mouse',       'Electronics',     29.99, 200, 'TechSupply Co.'),
  ('Ergonomic Chair',      'Furniture',      349.99,  30, 'OfficeWorld'),
  ('Standing Desk',        'Furniture',      699.99,  15, 'OfficeWorld'),
  ('4K Monitor 27"',       'Electronics',   499.99,   60, 'DisplayTech'),
  ('Noise-Cancel Headset', 'Electronics',   149.99,   80, 'AudioPro'),
  ('Mechanical Keyboard',  'Electronics',    89.99,  120, 'TechSupply Co.'),
  ('Webcam HD 1080p',      'Electronics',    69.99,   95, 'DisplayTech'),
  ('Desk Lamp LED',        'Furniture',      39.99,  150, 'OfficeWorld'),
  ('USB-C Hub 7-in-1',     'Electronics',    49.99,  175, 'TechSupply Co.');

-- Orders
INSERT INTO orders (customer_id, product_id, quantity, total_price, status, order_date) VALUES
  (1, 1, 1, 1299.99, 'delivered',   '2024-01-15 10:30:00'),
  (2, 5, 2,  999.98, 'delivered',   '2024-01-18 14:20:00'),
  (3, 3, 1,  349.99, 'shipped',     '2024-02-02 09:10:00'),
  (4, 7, 2,  179.98, 'delivered',   '2024-02-14 16:45:00'),
  (5, 2, 3,   89.97, 'delivered',   '2024-03-01 11:00:00'),
  (6, 6, 1,  149.99, 'processing',  '2024-03-20 13:30:00'),
  (7, 4, 1,  699.99, 'pending',     '2024-04-05 08:55:00'),
  (8, 8, 2,  139.98, 'shipped',     '2024-04-12 17:20:00'),
  (9, 9, 4,  159.96, 'delivered',   '2024-04-28 10:05:00'),
  (10,10, 1,  49.99, 'delivered',   '2024-05-03 12:40:00'),
  (1, 6, 1,  149.99, 'cancelled',   '2024-05-10 09:00:00'),
  (3, 1, 2, 2599.98, 'processing',  '2024-05-22 14:15:00'),
  (5, 5, 1,  499.99, 'pending',     '2024-06-01 11:30:00'),
  (2, 3, 1,  349.99, 'shipped',     '2024-06-10 16:00:00'),
  (4, 2, 5,  149.95, 'delivered',   '2024-06-15 10:45:00');
