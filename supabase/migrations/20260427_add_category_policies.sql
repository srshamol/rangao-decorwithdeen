-- Add management policies for categories
CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
