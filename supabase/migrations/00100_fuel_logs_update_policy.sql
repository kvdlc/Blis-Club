-- Allow users to update their own fuel logs (editing in Bitacora)
CREATE POLICY "Users can update own fuel logs"
  ON fuel_logs FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()))
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));
