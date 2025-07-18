-- Database is already created by docker-compose environment variable
-- We are already connected to the travel_expenses database

-- Create enum types
CREATE TYPE user_role AS ENUM ('employee', 'accounting');
CREATE TYPE expense_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'paid');
CREATE TYPE expense_category AS ENUM ('transportation', 'accommodation', 'meal', 'other');
CREATE TYPE approval_action AS ENUM ('submitted', 'approved', 'rejected', 'paid');

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expense_reports table
CREATE TABLE IF NOT EXISTS expense_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    trip_purpose TEXT NOT NULL,
    trip_start_date DATE NOT NULL,
    trip_end_date DATE NOT NULL,
    status expense_status NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expense_items table
CREATE TABLE IF NOT EXISTS expense_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    category expense_category NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_url VARCHAR(500),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    action approval_action NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_expense_reports_user_id ON expense_reports(user_id);
CREATE INDEX idx_expense_reports_status ON expense_reports(status);
CREATE INDEX idx_expense_items_report_id ON expense_items(expense_report_id);
CREATE INDEX idx_approval_history_report_id ON approval_history(expense_report_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_reports_updated_at BEFORE UPDATE ON expense_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at BEFORE UPDATE ON expense_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial test data
-- Both users have password: "password"
INSERT INTO users (email, password, name, role, department) VALUES
    ('admin@example.com', '$2b$10$iOZUWKdy9eR7SVLW7V7rbO8WQPvrtfT9axHz8qmtHK6rRUSZf1Ony', '経理部管理者', 'accounting', '経理部'),
    ('employee1@example.com', '$2b$10$iOZUWKdy9eR7SVLW7V7rbO8WQPvrtfT9axHz8qmtHK6rRUSZf1Ony', '社員太郎', 'employee', '営業部');