-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);

-- Enable Row Level Security (optional, since our Node backend uses service role to query and does authorization at the API layer with Cerbos)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
