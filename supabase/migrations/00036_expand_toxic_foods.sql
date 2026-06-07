-- 00036_expand_toxic_foods.sql
-- Expansión masiva de la base de datos de alimentos
-- Agrega categoría y ~200+ alimentos con datos detallados

-- 1. Agregar columna category
ALTER TABLE toxic_foods ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Limpiar datos antiguos
DELETE FROM toxic_foods;

-- 3. Insertar alimentos tóxicos y seguros
INSERT INTO toxic_foods (name, is_toxic, severity, category, explanation, symptoms) VALUES

-- ═══════════════════════════════════════════════════════════
-- ☠️ MORTAL
-- ═══════════════════════════════════════════════════════════

-- Chocolate y derivados
('Chocolate negro', true, 'mortal', 'dulces', 'Contiene teobromina y cafeína. Los perros no pueden metabolizar estas metilxantinas, causando sobreestimulación severa: hiperactividad, taquicardia, temblores musculares y fallo cardíaco. Dosis peligrosa (10kg): 15-20g (1-2 cuadritos). (20kg): 30-40g. (30-40kg): 50-70g.', 'Hiperactividad, taquicardia, temblores musculares, vómitos, diarrea, convulsiones, fallo cardíaco'),
('Chocolate bitter', true, 'mortal', 'dulces', 'Variedad de chocolate con mayor concentración de cacao y teobromina. Más peligroso que el chocolate con leche. Dosis (10kg): 10-15g. (20kg): 20-30g. (30-40kg): 40-50g puede ser fatal.', 'Hiperactividad, taquicardia, temblores, convulsiones, fallo cardíaco'),
('Cacao puro', true, 'mortal', 'dulces', 'Forma más concentrada de teobromina. Extremadamente tóxico incluso en cantidades mínimas. Dosis (10kg): 5-10g. (20kg): 15-20g. (30-40kg): 25-35g.', 'Taquicardia severa, temblores, convulsiones, colapso cardíaco'),
('Cocoa', true, 'mortal', 'dulces', 'Polvo de cacao procesado. Alta concentración de teobromina. Usado en repostería y bebidas. Dosis peligrosa similar al cacao puro.', 'Vómitos, diarrea, taquicardia, temblores, convulsiones'),
('Chocolate para taza', true, 'mortal', 'dulces', 'Tabletas o polvo para preparar chocolate caliente. Contiene teobromina concentrada. Dosis (10kg): 15-25g. (20-40kg): 50-70g.', 'Hiperactividad, vómitos, taquicardia, temblores musculares'),
('Cobertura de repostería', true, 'mortal', 'dulces', 'Chocolate de alta pureza usado para cubrir tortas y postres. Altísima concentración de cacao y teobromina. Una tableta pequeña puede ser fatal.', 'Taquicardia severa, temblores, hiperactividad, fallo cardíaco'),

-- Uvas y pasas
('Uvas', true, 'mortal', 'frutas', 'Contienen ácido tartárico que provoca daño renal agudo. Los riñones colapsan y dejan de filtrar toxinas. NO HAY DOSIS SEGURA. (10kg): 1-2 uvas. (20kg): 3-4 uvas. (30-40kg): un pequeño puñado puede ser fatal.', 'Vómitos, diarrea, letargo, dolor abdominal, fallo renal agudo, deja de orinar'),
('Pasas', true, 'mortal', 'frutas', 'Uvas deshidratadas. El ácido tartárico está aún más concentrado. Altamente tóxico. (10kg): 1-2 pasas. (20kg): 3-4 pasas. (30-40kg): pequeño puñado en galletas o panetón puede ser fatal.', 'Vómitos, diarrea, letargo, fallo renal agudo, deja de orinar'),
('Uvas secas', true, 'mortal', 'frutas', 'Otro nombre para las pasas. Ácido tartárico concentrado. Toxicidad impredecible. No hay dosis segura.', 'Fallo renal agudo, vómitos, diarrea, letargo'),
('Sultanas', true, 'mortal', 'frutas', 'Variedad de uva pasa. Mismo riesgo que las pasas comunes. Ácido tartárico concentrado.', 'Fallo renal, vómitos, letargo, deja de orinar'),
('Pasas de Corinto', true, 'mortal', 'frutas', 'Pequeñas pasas oscuras. Extremadamente concentradas en ácido tartárico. Muy pocas pueden causar daño renal severo.', 'Vómitos, diarrea, dolor abdominal, fallo renal agudo'),

-- Xilitol
('Xilitol', true, 'mortal', 'dulces', 'Edulcorante artificial. El páncreas del perro lo confunde con azúcar real y libera insulina masiva → hipoglucemia letal y necrosis hepática. Dosis (10kg): 0.5g (1-2 chicles sin azúcar). (20kg): 1g. (30-40kg): 1.5-2g.', 'Hipoglucemia súbita, vómitos, letargo, convulsiones, colapso, necrosis hepática'),
('Azúcar de abedul', true, 'mortal', 'dulces', 'Nombre alternativo del xilitol. Edulcorante natural pero letal para perros. Presente en chicles, caramelos y pasta dental sin azúcar.', 'Hipoglucemia, vómitos, convulsiones, daño hepático'),
('Aditivo E967', true, 'mortal', 'quimicos', 'Código de aditivo alimentario del xilitol. Revisar etiquetas de productos "sin azúcar" o "light". Letal en pequeñas cantidades.', 'Hipoglucemia severa, colapso, necrosis hepática'),

-- Cebolla y familia Allium
('Cebolla', true, 'mortal', 'verduras', 'Contiene tiosulfatos que oxidan la hemoglobina → anemia hemolítica severa. Los glóbulos rojos se rompen. El polvo deshidratado es 5x más letal. Dosis (10kg): 15-30g (1/4 cebolla). (20kg): 50g. (30-40kg): 100g (una cebolla entera).', 'Anemia hemolítica, debilidad, encías pálidas, vómitos, dificultad respiratoria, orina oscura'),
('Cebolla paiteña', true, 'mortal', 'verduras', 'Variedad de cebolla. Mismo compuesto tóxico: tiosulfatos. Causa anemia hemolítica.', 'Debilidad, encías pálidas, vómitos, orina oscura, dificultad para respirar'),
('Cebolla colorada', true, 'mortal', 'verduras', 'Variedad de cebolla morada. Contiene tiosulfatos. Igual de tóxica que la cebolla blanca.', 'Anemia, debilidad, vómitos, encías pálidas'),
('Cebolla perla', true, 'mortal', 'verduras', 'Cebollas pequeñas. Muy concentradas. Pocas unidades pueden intoxicar a un perro pequeño.', 'Anemia hemolítica, vómitos, debilidad extrema'),
('Ajo', true, 'mortal', 'verduras', 'Contiene tiosulfatos como la cebolla pero más concentrados. El ajo en polvo es extremadamente peligroso. Dosis (10kg): 1 diente. (30-40kg): 1 cucharada de ajo en polvo.', 'Anemia hemolítica, vómitos, diarrea, debilidad, taquicardia'),
('Puerro', true, 'mortal', 'verduras', 'Parte de la familia Allium. Contiene tiosulfatos que causan anemia hemolítica en perros.', 'Anemia, vómitos, debilidad, encías pálidas'),
('Ajoporro', true, 'mortal', 'verduras', 'Similar al puerro. Familia Allium. Causa daño oxidativo a glóbulos rojos.', 'Anemia hemolítica, debilidad, dificultad respiratoria'),
('Cebolla china', true, 'mortal', 'verduras', 'También llamada cebolleta. Familia Allium. Tóxica para perros.', 'Anemia, vómitos, letargo, encías pálidas'),
('Cebollín', true, 'mortal', 'verduras', 'Hierba de la familia Allium. Contiene tiosulfatos. Usado como condimento.', 'Anemia hemolítica, debilidad, vómitos'),
('Chalota', true, 'mortal', 'verduras', 'Tipo de cebolla pequeña y alargada. Familia Allium. Tóxica.', 'Anemia, vómitos, letargo, dificultad respiratoria'),

-- Macadamia
('Nuez de macadamia', true, 'mortal', 'frutos_secos', 'Ataca las neuronas motoras. Causa debilidad extrema, parálisis temporal de patas traseras, fiebre alta y temblores. Dosis (10kg): 2-3 nueces. (20kg): 4-6. (30-40kg): 8-10.', 'Debilidad extrema, parálisis patas traseras, fiebre alta, temblores, vómitos'),
('Nuez de Queensland', true, 'mortal', 'frutos_secos', 'Otro nombre de la nuez de macadamia. Mismo efecto neurotóxico.', 'Parálisis temporal, fiebre, temblores, debilidad'),
('Nuez australiana', true, 'mortal', 'frutos_secos', 'Otro nombre comercial de la macadamia. Neurotóxica para perros.', 'Debilidad, parálisis trasera, fiebre, vómitos'),

-- Masa cruda y alcohol
('Masa con levadura viva', true, 'mortal', 'masas', 'La levadura fermenta en el estómago produciendo alcohol puro. La masa se expande y puede reventar el estómago. Emergencia absoluta.', 'Distensión abdominal severa, vómitos, intoxicación etílica, letargo, colapso'),
('Masa para pizza', true, 'mortal', 'masas', 'Masa cruda con levadura. Fermenta en el estómago → alcohol + expansión de gases. Puede causar torsión gástrica.', 'Distensión, dolor abdominal, intoxicación, vómitos'),
('Masa de pan', true, 'mortal', 'masas', 'Masa de pan cruda. La levadura produce etanol en el estómago. Emergencia quirúrgica por riesgo de torsión.', 'Distensión abdominal, vómitos, alcohol en sangre, colapso'),
('Alcohol', true, 'mortal', 'bebidas', 'El hígado canino no procesa el etanol. Cualquier cantidad de licor, cerveza o vino es peligrosa. Deprime el sistema nervioso central.', 'Vómitos, desorientación, depresión respiratoria, coma, muerte'),
('Cerveza', true, 'mortal', 'bebidas', 'Contiene etanol y lúpulo (doblemente tóxico). Incluso pequeñas cantidades son peligrosas.', 'Vómitos, jadeo excesivo, taquicardia, hipertermia, convulsiones'),
('Aguardiente', true, 'mortal', 'bebidas', 'Licor de alta graduación. Extremadamente tóxico. Un par de onzas es emergencia veterinaria.', 'Depresión SNC, coma, fallo respiratorio, muerte'),
('Pisco', true, 'mortal', 'bebidas', 'Destilado de uva. Alta graduación alcohólica. Tóxico para perros.', 'Vómitos, desorientación, depresión respiratoria, coma'),
('Licor', true, 'mortal', 'bebidas', 'Bebidas alcohólicas destiladas. El etanol es altamente tóxico para perros.', 'Intoxicación etílica, vómitos, colapso, fallo respiratorio'),

-- Anticongelante
('Anticongelante', true, 'mortal', 'quimicos', 'Contiene etilenglicol. Sabor dulce que atrae perros. Se cristaliza en los riñones destruyéndolos en 24-72h. Dosis (10kg): 45ml. (20kg): 90ml. (30-40kg): 130-170ml.', 'Vómitos, letargo, sed extrema, fallo renal agudo, convulsiones, muerte'),
('Refrigerante de motor', true, 'mortal', 'quimicos', 'Otro nombre del anticongelante. Contiene etilenglicol. Letal.', 'Fallo renal, vómitos, desorientación, convulsiones'),
('Líquido de radiador', true, 'mortal', 'quimicos', 'Sinónimo de anticongelante. Etilenglicol. Destruye los riñones.', 'Sed extrema, vómitos, fallo renal, muerte'),

-- Venenos y raticidas
('Raticida', true, 'mortal', 'quimicos', 'Bloquea la vitamina K impidiendo coagulación → desangramiento interno. También puede causar edema cerebral. Comer un roedor envenenado es letal.', 'Sangrado interno, hematomas, encías pálidas, dificultad respiratoria, colapso'),
('Mataratas', true, 'mortal', 'quimicos', 'Nombre comercial de raticidas. Anticoagulante potente. Emergencia veterinaria inmediata.', 'Hemorragia interna, debilidad, colapso, muerte'),
('Veneno para caracoles', true, 'mortal', 'quimicos', 'Contiene metaldehído. Eleva la temperatura corporal hasta "freír" los órganos internos. Altamente letal.', 'Hipertermia severa, temblores, convulsiones, fallo multiorgánico'),

-- Medicamentos humanos
('Paracetamol', true, 'mortal', 'medicamentos', 'Destruye glóbulos rojos y el hígado en pocas horas. Dosis (10kg): media pastilla 500mg letal. (20kg): 1 pastilla. (30-40kg): 1-2 pastillas.', 'Vómitos, ictericia, dificultad respiratoria, fallo hepático, muerte'),
('Acetaminofén', true, 'mortal', 'medicamentos', 'Nombre genérico del paracetamol (Tylenol, Panadol). Destruye el hígado canino.', 'Fallo hepático, vómitos, encías amarillas, letargo'),
('Ibuprofeno', true, 'mortal', 'medicamentos', 'Antiinflamatorio humano. Corta el flujo sanguíneo a los riñones y perfora la pared del estómago. Letal en dosis bajas.', 'Úlceras gástricas sangrantes, fallo renal, vómitos con sangre'),
('Naproxeno', true, 'mortal', 'medicamentos', 'Antiinflamatorio (Apronax). Causa fallo multiorgánico y úlceras sangrantes severas en dosis muy bajas.', 'Vómitos con sangre, fallo renal, letargo, colapso'),

-- Cápsulas de detergente
('Cápsulas de detergente', true, 'mortal', 'quimicos', 'El envoltorio plástico se disuelve con la saliva y estalla liberando químicos cáusticos. Si aspira entra a pulmones → neumonía química fatal en minutos. Una sola cápsula es emergencia.', 'Quemaduras en boca y garganta, vómitos, dificultad respiratoria, neumonía química'),
('Pods de lavadora', true, 'mortal', 'quimicos', 'Otro nombre de las cápsulas de detergente. Mismo riesgo de explosión química en boca y aspiración pulmonar.', 'Quemaduras químicas, dificultad respiratoria, vómitos'),

-- Arena para gatos
('Arena para gatos aglomerante', true, 'mortal', 'mascotas', 'Arcilla que se expande con la humedad. Si el perro la ingiere, crea una obstrucción intestinal total que requiere cirugía. Un par de bocados bloquean el intestino.', 'Vómitos, estreñimiento severo, dolor abdominal, obstrucción intestinal, requiere cirugía'),
('Piedritas sanitarias para gato', true, 'mortal', 'mascotas', 'Arena aglomerante. La bentonita de sodio se expande dentro del intestino.', 'Obstrucción intestinal, vómitos, dolor abdominal severo'),

-- Fertilizantes orgánicos
('Harina de sangre', true, 'mortal', 'jardin', 'Fertilizante orgánico. Huele a comida y los perros lo tragan. Forma una pasta dura que bloquea el tracto digestivo como cemento.', 'Obstrucción intestinal, vómitos, dolor abdominal severo'),
('Harina de hueso', true, 'mortal', 'jardin', 'Fertilizante orgánico con olor atractivo para perros. Causa bloqueo intestinal masivo.', 'Obstrucción, vómitos, estreñimiento severo'),

-- Setas silvestres
('Setas silvestres', true, 'mortal', 'hongos', 'Hongos no comestibles recolectados del campo/parque. Muchas especies contienen toxinas que destruyen el hígado. No hay forma de identificar las seguras a simple vista.', 'Vómitos, diarrea sanguinolenta, ictericia, fallo hepático, convulsiones, muerte'),
('Hongos del parque', true, 'mortal', 'hongos', 'Hongos silvestres que crecen en jardines y parques. Imposible distinguir tóxicos de no tóxicos sin experto.', 'Fallo hepático, vómitos, diarrea, desorientación'),

-- ═══════════════════════════════════════════════════════════
-- 🔴 ALTO
-- ═══════════════════════════════════════════════════════════

-- Sobras grasas y pancreatitis
('Tocino', true, 'alto', 'carnes_grasas', 'Altísimo en grasa. Desencadena pancreatitis aguda: las enzimas digestivas se activan y digieren el propio páncreas. Dosis (10kg): 1-2 tiras. (20kg): 1 plato pequeño.', 'Pancreatitis aguda, vómitos severos, dolor abdominal, deshidratación, letargo'),
('Panceta', true, 'alto', 'carnes_grasas', 'Grasa de cerdo curada. Mismo riesgo de pancreatitis que el tocino.', 'Vómitos, dolor abdominal, pancreatitis, diarrea'),
('Piel de pollo asado', true, 'alto', 'carnes_grasas', 'Piel grasosa del pollo rostizado. Alto contenido de grasa concentrada → pancreatitis.', 'Pancreatitis, vómitos, diarrea, letargo'),
('Grasa de parrillada', true, 'alto', 'carnes_grasas', 'Recortes grasosos de carne asada. El páncreas canino no tolera estos picos de grasa.', 'Pancreatitis aguda, vómitos, dolor abdominal intenso'),
('Chicharrones', true, 'alto', 'carnes_grasas', 'Piel de cerdo frita. Grasa pura que desencadena pancreatitis severa.', 'Pancreatitis, vómitos, diarrea, deshidratación'),
('Manteca', true, 'alto', 'carnes_grasas', 'Grasa animal pura. Extremadamente peligrosa para el páncreas canino.', 'Pancreatitis aguda, vómitos, dolor abdominal'),

-- Huesos cocidos
('Huesos de pollo cocido', true, 'alto', 'huesos', 'La cocción seca el colágeno → al morderlos se astillan como agujas. Pueden perforar esófago, estómago o intestinos. Una sola astilla es peligrosa.', 'Perforación intestinal, peritonitis, vómitos con sangre, dolor abdominal severo'),
('Huesos de costilla asada', true, 'alto', 'huesos', 'Huesos cocidos que se astillan al masticar. Riesgo de perforación intestinal.', 'Perforación, sangrado interno, vómitos, dolor'),
('Huesos de sopa', true, 'alto', 'huesos', 'Huesos hervidos por horas. Frágiles y quebradizos. Se astillan en fragmentos punzantes.', 'Perforación intestinal, obstrucción, vómitos'),
('Espinas de pescado grueso', true, 'alto', 'huesos', 'Espinas cocidas. Se clavan en la garganta o intestino. Riesgo de perforación.', 'Atragantamiento, perforación, dolor, vómitos'),

-- Coronta de maíz
('Coronta de choclo', true, 'alto', 'verduras', 'El centro del choclo es 100% indigerible. Actúa como un corcho bloqueando el intestino y causando necrosis. Dosis (10-20kg): 3-5cm bastan.', 'Obstrucción intestinal, vómitos, dolor abdominal, estreñimiento, requiere cirugía'),
('Tusa de maíz', true, 'alto', 'verduras', 'Otro nombre de la coronta. Igual de peligrosa. Bloquea el intestino.', 'Obstrucción intestinal, vómitos, dolor abdominal'),
('Olote', true, 'alto', 'verduras', 'Nombre del centro del elote/maíz. Indigerible. Riesgo de bloqueo intestinal.', 'Obstrucción, vómitos, estreñimiento severo'),

-- Huesos de frutas grandes
('Hueso de aguacate', true, 'alto', 'frutas', 'Tamaño perfecto para atascarse en esófago o bloquear el estómago. Riesgo de asfixia y obstrucción. Tragar 1 solo hueso = alerta quirúrgica.', 'Atragantamiento, obstrucción esofágica, vómitos, dolor abdominal'),
('Pepa de durazno', true, 'alto', 'frutas', 'Contiene trazas de cianuro (amigdalina). El riesgo real es atoramiento y obstrucción intestinal.', 'Atragantamiento, obstrucción, vómitos, dolor abdominal'),
('Carozo de ciruela', true, 'alto', 'frutas', 'Hueso de ciruela. Riesgo de atoramiento y trazas de cianuro. Alerta quirúrgica.', 'Obstrucción, atragantamiento, vómitos'),
('Semilla de mango', true, 'alto', 'frutas', 'Hueso grande y fibroso del mango. Obstruye el tracto digestivo.', 'Obstrucción intestinal, vómitos, dolor abdominal'),

-- Exceso de sal
('Sal de mesa en exceso', true, 'alto', 'condimentos', 'Los riñones caninos no procesan el exceso de sodio. Causa hipernatremia: extrae agua de las células (incluyendo cerebro) → convulsiones. Dosis (10kg): 1/2 cdita. (20kg): 1-1.5 cdita. (30-40kg): 2.5-3 cdita.', 'Sed extrema, vómitos, diarrea, temblores, convulsiones, confusión'),
('Salsa de soja', true, 'alto', 'condimentos', 'Extremadamente alta en sodio. Una pequeña cantidad puede causar intoxicación por sal.', 'Sed excesiva, vómitos, temblores, desorientación'),
('Agua de mar', true, 'alto', 'bebidas', 'Beber agua de mar al jugar en la playa causa hipernatremia por el alto contenido de sal.', 'Vómitos, diarrea, sed extrema, temblores, desorientación'),
('Papas fritas de bolsa', true, 'alto', 'snacks', 'Altas en sal y grasas. El exceso de sodio es peligroso para perros.', 'Sed excesiva, vómitos, pancreatitis por la grasa'),

-- Frutos secos comunes
('Nueces de nogal', true, 'alto', 'frutos_secos', 'Altas en grasas aceitosas que irritan el estómago y pueden detonar pancreatitis. Si están viejas desarrollan micotoxinas tremorgénicas → temblores neurológicos. Dosis (10kg): 3-5 nueces.', 'Vómitos, diarrea, temblores musculares, pancreatitis'),
('Almendras', true, 'alto', 'frutos_secos', 'Difíciles de digerir. Alto contenido graso → riesgo de pancreatitis. Pueden causar obstrucción en perros pequeños.', 'Vómitos, diarrea, dolor abdominal, pancreatitis'),
('Pecanas', true, 'alto', 'frutos_secos', 'Similar a las nueces. Altas en grasa. Pueden contener micotoxinas si están añejas.', 'Vómitos, temblores, pancreatitis, diarrea'),

-- Hojas de ruibarbo
('Hojas de ruibarbo', true, 'alto', 'verduras', 'Contienen oxalatos solubles que causan fallo renal. Los tallos son comestibles pero las hojas son tóxicas.', 'Fallo renal, vómitos, diarrea, letargo, temblores'),
('Ruibarbo (hojas)', true, 'alto', 'verduras', 'Las hojas contienen altos niveles de oxalatos y antraquinonas tóxicas.', 'Fallo renal, babeo excesivo, vómitos, debilidad'),

-- Nuez moscada
('Nuez moscada', true, 'alto', 'condimentos', 'Contiene miristicina, un compuesto alucinógeno y tóxico para perros. Causa desorientación severa, alucinaciones y taquicardia.', 'Desorientación, alucinaciones, taquicardia, vómitos, temblores'),

-- Cafeína
('Cafeína', true, 'alto', 'bebidas', 'Estimulante que los perros metabolizan muy lentamente. Causa sobreestimulación cardíaca y neurológica. Presente en café, té, bebidas energéticas.', 'Hiperactividad, taquicardia, jadeo excesivo, temblores, convulsiones'),
('Café', true, 'alto', 'bebidas', 'Contiene cafeína. Incluso lamer restos de café puede causar síntomas en perros pequeños.', 'Hiperactividad, taquicardia, vómitos, temblores'),
('Bebidas energéticas', true, 'alto', 'bebidas', 'Altas en cafeína y otros estimulantes. Muy peligrosas para perros.', 'Taquicardia severa, temblores, hiperactividad, colapso'),

-- Comida para gatos
('Croquetas de gato', true, 'alto', 'mascotas', 'Formuladas para felinos con mucha más proteína y grasa de la que un perro necesita. Causa diarrea, gases y a largo plazo daño renal. Unos bocados = malestar.', 'Diarrea, gases, vómitos, mal olor corporal, daño renal crónico'),
('Paté de gato', true, 'alto', 'mascotas', 'Comida húmeda felina. Exceso de proteína y grasa para perros. Malestar digestivo.', 'Diarrea, vómitos, gases, malestar estomacal'),
('Sobres de comida húmeda para gato', true, 'alto', 'mascotas', 'Alimento felino. No formulado para perros. Causa trastornos digestivos.', 'Diarrea, vómitos, flatulencia'),

-- Carnazas comerciales
('Carnazas comerciales', true, 'alto', 'masticables', 'Cueros procesados con químicos. Difíciles de digerir. Un perro fuerte arranca pedazos grandes que se ablandan como chicle y pueden obstruir.', 'Indigestión, vómitos, diarrea con mucosidad, obstrucción parcial'),
('Huesos de carnaza prensada', true, 'alto', 'masticables', 'Cuero procesado industrialmente. Se hincha en el estómago. Difícil de digerir.', 'Vómitos, diarrea, estreñimiento, malestar abdominal'),
('Palitos de cuero', true, 'alto', 'masticables', 'Carnaza enrollada. Pedazos grandes pueden causar obstrucción.', 'Obstrucción parcial, vómitos, diarrea'),

-- ═══════════════════════════════════════════════════════════
-- 🟡 BAJO / MEDIO
-- ═══════════════════════════════════════════════════════════

('Brócoli crudo', true, 'bajo', 'verduras', 'Contiene isotiocianatos que irritan el intestino y generan gases masivos. En pequeñas cantidades al vapor es seguro.', 'Gases, distensión abdominal, dolor de barriga'),
('Coliflor cruda', true, 'bajo', 'verduras', 'Causa flatulencia severa si se da cruda. Cocida al vapor en pequeñas porciones es tolerable.', 'Gases, molestia abdominal'),
('Repollo crudo', true, 'bajo', 'verduras', 'Genera muchos gases intestinales. Mejor cocido y en poca cantidad.', 'Flatulencia, distensión abdominal'),
('Col cruda', true, 'bajo', 'verduras', 'Verduras crucíferas crudas = gases. Cocidas al vapor son más seguras.', 'Gases, dolor abdominal leve'),
('Leche de vaca', true, 'bajo', 'lacteos', 'La mayoría de perros adultos son intolerantes a la lactosa. Causa diarrea y gases.', 'Diarrea, gases, malestar estomacal'),
('Helado', true, 'bajo', 'lacteos', 'Alto en azúcar y lactosa. La mayoría de perros no toleran los lácteos. Puede contener xilitol o chocolate.', 'Diarrea, vómitos, gases'),
('Pan de molde', true, 'bajo', 'masas', 'Calorías vacías. Fermenta en el sistema digestivo causando pesadez. No es tóxico pero no aporta nada.', 'Digestión lenta, gases, obesidad a largo plazo'),
('Corteza de pizza cocida', true, 'bajo', 'masas', 'Carbohidratos refinados. Puede contener ajo/cebolla en la masa. Pesadez digestiva.', 'Pesadez, gases, posible toxicidad si tiene ajo/cebolla'),
('Galletas de agua', true, 'bajo', 'masas', 'Calorías vacías. Alto contenido de sal en algunas marcas.', 'Sed, sin valor nutricional'),
('Fideos', true, 'bajo', 'masas', 'Hervidos sin salsa son seguros pero solo aportan calorías vacías.', 'Digestión lenta, obesidad si se da frecuentemente'),
('Corazón de manzana', true, 'bajo', 'frutas', 'Las semillas contienen trazas de cianuro (tendría que masticar cientos para intoxicarse). El riesgo real es atragantamiento con el tallo fibroso.', 'Atragantamiento leve, tos, arcadas'),
('Semillas de manzana', true, 'bajo', 'frutas', 'Contienen amigdalina (precursor del cianuro). Tóxicas solo en cantidades muy grandes (cientos de semillas masticadas).', 'Potencial toxicidad por cianuro en dosis masivas'),
('Huevo crudo', true, 'bajo', 'proteinas', 'Riesgo de salmonela y deficiencia de biotina (la clara cruda contiene avidina). Mejor darlo cocido.', 'Posible salmonelosis, deficiencia de biotina a largo plazo'),
('Pescado crudo', true, 'bajo', 'proteinas', 'Riesgo de parásitos (anisakis) y deficiencia de tiamina. Siempre cocido o congelado previamente.', 'Parásitos, vómitos, deficiencia vitamínica'),
('Carne cruda en exceso', true, 'bajo', 'proteinas', 'En dieta BARF es segura, pero carne de dudosa procedencia puede tener bacterias. No dar carne cruda de supermercado sin cadena de frío.', 'Riesgo bacteriano, salmonela, E.coli'),
('Embutidos', true, 'bajo', 'carnes', 'Salchichas, jamón, mortadela. Altos en sodio, conservantes y grasas saturadas. No son tóxicos pero son poco saludables.', 'Sed excesiva, obesidad, pancreatitis con consumo frecuente'),
('Azúcar y dulces', true, 'bajo', 'dulces', 'Causan picos de insulina, obesidad, problemas dentales. No son tóxicos pero son muy dañinos a largo plazo.', 'Obesidad, diabetes, caries, hiperactividad'),
('Coco', true, 'bajo', 'frutas', 'La pulpa fresca en pequeñas cantidades es segura. El agua de coco es buena. En exceso causa diarrea por el alto contenido de aceite.', 'Diarrea, heces blandas'),
('Cítricos en exceso', true, 'bajo', 'frutas', 'Limón, naranja, toronja en grandes cantidades irritan el estómago por la acidez. Pequeños trozos ocasionales son seguros.', 'Irritación estomacal, vómitos, diarrea'),
('Aguacate', true, 'bajo', 'frutas', 'La pulpa contiene persina, una toxina leve para perros. El hueso es peligroso por obstrucción. En pequeñas cantidades la pulpa no suele causar problemas.', 'Vómitos leves, diarrea. El hueso causa obstrucción'),

-- ═══════════════════════════════════════════════════════════
-- ✅ SEGUROS - PROTEÍNAS
-- ═══════════════════════════════════════════════════════════

('Pechuga de pollo', false, null, 'proteinas', 'Hervida o a la plancha. La proteína más segura y suave para el estómago canino. Base de la dieta blanda.', null),
('Carne de res magra', false, null, 'proteinas', 'Molida o en trozos. Excelente fuente de hierro y aminoácidos. Cocida sin sal ni condimentos.', null),
('Pavo', false, null, 'proteinas', 'Carne blanca pura, muy baja en grasa. Ideal para perros con estómagos sensibles.', null),
('Carne de cerdo magra', false, null, 'proteinas', 'Solo cortes magros como el lomo. Siempre bien cocidos. Sin sal ni condimentos.', null),
('Salmón cocido', false, null, 'proteinas', 'Cocido o a la plancha. NUNCA crudo por riesgo de parásitos. Rico en Omega 3 para pelaje brillante.', null),
('Atún al agua', false, null, 'proteinas', 'Enlatado en agua, lavado para quitar exceso de sodio. Con moderación.', null),
('Sardinas en agua', false, null, 'proteinas', 'Excelente fuente de aceites grasos para articulaciones. Sin sal añadida.', null),
('Huevo cocido', false, null, 'proteinas', 'Cocido, duro o revuelto sin aceite. Excelente proteína rápida y segura.', null),
('Hígado de res', false, null, 'proteinas', 'Hervido. Súper alimento rico en hierro. Dar en pequeñas cantidades para evitar exceso de vitamina A.', null),
('Hígado de pollo', false, null, 'proteinas', 'Hervido. Mismos beneficios que el de res. Moderación.', null),
('Corazones de pollo', false, null, 'proteinas', 'Bien cocidos. Ricos en taurina, esencial para la salud cardíaca.', null),
('Mollejas de pollo', false, null, 'proteinas', 'Bien cocidas. Aportan textura y nutrientes. Seguras.', null),
('Cordero', false, null, 'proteinas', 'Proteína alternativa excelente si el perro tiene alergia al pollo. Cocido.', null),
('Pato', false, null, 'proteinas', 'Excelente fuente de energía y grasas saludables. Cocido.', null),
('Conejo', false, null, 'proteinas', 'Una de las carnes más magras e hipoalergénicas. Ideal para perros alérgicos.', null),
('Pescado blanco', false, null, 'proteinas', 'Tilapia, merluza, bacalao. Cocidos al vapor. Ligeros para el estómago.', null),
('Trucha', false, null, 'proteinas', 'Rica en Omega 3. Siempre cocida para evitar parásitos.', null),
('Cabrito', false, null, 'proteinas', 'Carne muy limpia y fácil de digerir. Cocida.', null),
('Pulmón de res', false, null, 'proteinas', 'Hervido o deshidratado. Excelente premio bajo en calorías. Textura esponjosa.', null),

-- ✅ SEGUROS - VERDURAS
('Zanahoria', false, null, 'verduras', 'Cruda en bastones (limpia dientes) o cocida. Excelente fuente de fibra y vitamina A.', null),
('Zapallo', false, null, 'verduras', 'Puré cocido puro. El mejor remedio natural para diarrea y estreñimiento.', null),
('Calabaza', false, null, 'verduras', 'Cocida y en puré. Regula el tránsito intestinal. Mismos beneficios que el zapallo.', null),
('Camote', false, null, 'verduras', 'Hervido y en puré. Carbohidrato complejo que aporta energía sostenida.', null),
('Batata', false, null, 'verduras', 'Otro nombre del camote. Hervida, fuente de energía y fibra.', null),
('Vainitas', false, null, 'verduras', 'Hervidas al vapor. Bajas en calorías y llenas de fibra.', null),
('Pepino', false, null, 'verduras', 'Crudo en rodajas. 90% agua, perfecto para hidratar en días calurosos.', null),
('Apio', false, null, 'verduras', 'En trozos pequeños. Refresca el aliento. Textura crujiente.', null),
('Calabacín', false, null, 'verduras', 'Cocido o rallado crudo sobre su comida. Ligero y nutritivo.', null),
('Espinaca', false, null, 'verduras', 'Hervida al vapor. Rica en hierro. En cantidades pequeñas.', null),
('Arvejas', false, null, 'verduras', 'Cocidas y sin vaina. Buenas congeladas y hervidas.', null),
('Pimientos dulces', false, null, 'verduras', 'Rojo, verde o amarillo. Sin semillas ni tallos. Crudos o cocidos.', null),
('Lechuga', false, null, 'verduras', 'Romana o iceberg. Aporta agua y crocancia. Poco valor nutricional.', null),
('Espárragos', false, null, 'verduras', 'Cortados en trozos pequeños y cocidos al vapor.', null),

-- ✅ SEGUROS - FRUTAS
('Manzana sin semillas', false, null, 'frutas', 'En gajos, sin el centro ni semillas. Premio dulce y crujiente.', null),
('Plátano', false, null, 'frutas', 'En rodajas o machacado. Aporta potasio. Con moderación por el azúcar natural.', null),
('Banano', false, null, 'frutas', 'Mismo que el plátano. Fuente de potasio y energía rápida.', null),
('Arándanos', false, null, 'frutas', 'Excelente antioxidante. Perfectos congelados como premios de entrenamiento.', null),
('Sandía sin semillas', false, null, 'frutas', 'Sin cáscara ni semillas. Hidratación perfecta para verano.', null),
('Melón', false, null, 'frutas', 'Pulpa pura sin semillas. Hidratante y dulce.', null),
('Fresas', false, null, 'frutas', 'Frescas y bien lavadas. Enzima natural que ayuda a blanquear dientes.', null),
('Pera', false, null, 'frutas', 'En gajos pequeños, sin semillas. Dulce y suave.', null),
('Mango', false, null, 'frutas', 'Solo la pulpa, jamás la pepa. Premio dulce tropical.', null),
('Papaya', false, null, 'frutas', 'Sin pepas ni cáscara. Contiene papaína que ayuda a la digestión.', null),
('Piña', false, null, 'frutas', 'Trocitos de pulpa. Poca cantidad por su acidez.', null),
('Durazno', false, null, 'frutas', 'Solo la pulpa tierna, jamás el hueso.', null),
('Frambuesas', false, null, 'frutas', 'Bajas en azúcar, altas en fibra. Seguras en pequeñas cantidades.', null),
('Moras', false, null, 'frutas', 'Similares a las frambuesas. Antioxidantes naturales.', null),
('Kiwi', false, null, 'frutas', 'Sin piel. Excelente fuente de vitamina C y fibra.', null),
('Coco', false, null, 'frutas', 'La pulpa blanca en tiritas es un premio delicioso. Agua de coco natural sin azúcar.', null),
('Mandarina', false, null, 'frutas', 'Sin pepas ni cáscara. Poca cantidad por el azúcar.', null),
('Guayaba', false, null, 'frutas', 'Sin semillas duras. Rica en vitamina C.', null),
('Chirimoya', false, null, 'frutas', 'Solo la pulpa blanca. Sin semillas ni cáscara. Dulce y cremosa.', null),

-- ✅ SEGUROS - GRANOS
('Arroz blanco', false, null, 'granos', 'Hervido solo con agua. El salvavidas para malestares estomacales (con pechuga hervida).', null),
('Avena', false, null, 'granos', 'Cocida en agua, sin azúcar ni leche. Excelente para piel y pelaje.', null),
('Quinoa', false, null, 'granos', 'Bien lavada y hervida. Alta en proteína vegetal.', null),
('Papa blanca', false, null, 'granos', 'Siempre hervida o al horno, sin cáscara. NUNCA cruda (contiene solanina).', null),

-- ✅ SEGUROS - EXTRAS
('Mantequilla de maní natural', false, null, 'extras', '100% maní, sin xilitol ni sal. Ideal para untar en juguetes. Verificar etiqueta.', null),
('Yogur natural sin azúcar', false, null, 'extras', 'Aporta probióticos para la flora intestinal. Sin azúcar ni edulcorantes.', null),
('Aceite de coco', false, null, 'extras', 'Media cucharadita en la comida. Mejora absorción de nutrientes y suaviza la piel.', null),
('Aceite de oliva', false, null, 'extras', 'Un chorrito esporádico. Grasas saludables para el pelaje.', null),
('Queso cottage', false, null, 'extras', 'Bajo en grasa y lactosa. De los pocos quesos bien tolerados por perros.', null),
('Caldo de huesos casero', false, null, 'extras', 'Huesos de res o pollo hervidos por horas (retirar sólidos). Sin cebolla ni ajo. Colágeno puro.', null),
('Miel de abeja', false, null, 'extras', 'Media cucharadita de miel pura. Ayuda con tos y alergias estacionales.', null),
('Semillas de chía', false, null, 'extras', 'Remojadas en agua. Súper hidratantes. Espolvorear sobre la comida.', null),
('Linaza molida', false, null, 'extras', 'Semillas de lino molidas. Excelentes para el pelaje.', null),
('Perejil rizado', false, null, 'extras', 'Una pizca picada. Mejora el mal aliento drásticamente.', null),
('Jengibre', false, null, 'extras', 'Pedacito minúsculo rallado. Remedio natural para náuseas y mareos en auto.', null),
('Cúrcuma', false, null, 'extras', 'Antiinflamatorio natural. Mezclar con aceite de coco o pimienta negra para absorción.', null),
('Manzanilla', false, null, 'extras', 'Infusión fría en el agua de beber. Relaja perros ansiosos y calma el estómago.', null);
