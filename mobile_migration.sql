-- 1. Create table for mobile device push tokens
CREATE TABLE IF NOT EXISTS public.mobile_devices (
    id SERIAL PRIMARY KEY,
    emp_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    device_token TEXT UNIQUE NOT NULL,
    platform TEXT CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_device_token ON public.mobile_devices(device_token);
CREATE INDEX IF NOT EXISTS idx_device_emp ON public.mobile_devices(emp_id);

-- 2. Add geofencing settings to employee records
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS home_office_lat NUMERIC DEFAULT 6.9271, -- Default: Colombo, Sri Lanka
ADD COLUMN IF NOT EXISTS home_office_lng NUMERIC DEFAULT 79.8612,
ADD COLUMN IF NOT EXISTS geofence_radius_meters INTEGER DEFAULT 200; -- 200m radius
