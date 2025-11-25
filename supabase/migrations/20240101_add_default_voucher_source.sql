-- Add is_default_voucher_source column to product_category
ALTER TABLE public.product_category
ADD COLUMN IF NOT EXISTS is_default_voucher_source boolean DEFAULT false;

-- Create a function to ensure only one category is the default
CREATE OR REPLACE FUNCTION public.ensure_single_default_voucher_source()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default_voucher_source = true THEN
    UPDATE public.product_category
    SET is_default_voucher_source = false
    WHERE id <> NEW.id AND is_default_voucher_source = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before update or insert
DROP TRIGGER IF EXISTS trigger_ensure_single_default_voucher_source ON public.product_category;

CREATE TRIGGER trigger_ensure_single_default_voucher_source
BEFORE INSERT OR UPDATE OF is_default_voucher_source ON public.product_category
FOR EACH ROW
WHEN (NEW.is_default_voucher_source = true)
EXECUTE FUNCTION public.ensure_single_default_voucher_source();
