-- Vehicle specs (fluids, capacities, manufacturer recommendations)
CREATE TABLE IF NOT EXISTS vehicle_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID UNIQUE NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tipo_aceite TEXT,
  viscosidad_aceite TEXT,
  capacidad_aceite_litros NUMERIC(5,2),
  tipo_refrigerante TEXT,
  capacidad_refrigerante_litros NUMERIC(5,2),
  tipo_freno TEXT,
  presion_neumaticos_delante INTEGER,
  presion_neumaticos_atras INTEGER,
  presion_neumaticos_repuesto INTEGER,
  capacidad_tanque_galones NUMERIC(5,1),
  octanaje_recomendado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own specs"
  ON vehicle_specs FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own specs"
  ON vehicle_specs FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own specs"
  ON vehicle_specs FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own specs"
  ON vehicle_specs FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));
