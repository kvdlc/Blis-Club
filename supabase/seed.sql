-- ============================================================
-- Dog Blis Club - Seed Data
-- ============================================================

-- NOTA: El perfil se crea automaticamente via trigger on_auth_user_created.
-- Para desarrollo, insertamos manualmente un perfil de prueba.
-- En produccion, auth.users y profiles se sincronizan via trigger.

-- Perfil de prueba (UUID fijo para desarrollo)
INSERT INTO profiles (id, email, display_name)
VALUES ('00000000-0000-4000-a000-000000000001', 'tutor@dogblis.club', 'Carlos Mendoza')
ON CONFLICT (id) DO NOTHING;

-- Perro: American Bully "Tank"
INSERT INTO dogs (id, owner_id, nombre, raza, edad_meses, peso_kg, objetivo_principal)
VALUES ('00000000-0000-4000-a000-000000000100', '00000000-0000-4000-a000-000000000001', 'Tank', 'American Bully', 12, 28.00, 'Obediencia básica y control de reactividad')
ON CONFLICT (id) DO NOTHING;

-- Perfil metabólico de Tank
INSERT INTO dog_metabolic_profiles (dog_id, activity_level, allergies, medical_conditions, feeding_pct)
VALUES ('00000000-0000-4000-a000-000000000100', 'activo', '{}', '{}', 2.5)
ON CONFLICT (dog_id) DO NOTHING;

-- ============================================================
-- DAILY_LOGS (3 dias de actividad)
-- ============================================================
INSERT INTO daily_logs (dog_id, fecha, nivel_estres, notas_conducta, comida_gramos) VALUES
('00000000-0000-4000-a000-000000000100', CURRENT_DATE - INTERVAL '2 days', 2, 'Buen dia. Tank respondio bien al comando "junto" en el paseo matutino. Sin reactividad.', 550),
('00000000-0000-4000-a000-000000000100', CURRENT_DATE - INTERVAL '1 day', 3, 'Tank se puso tenso al ver una moto. Logre redirigir con premio. Comio con buen apetito.', 500),
('00000000-0000-4000-a000-000000000100', CURRENT_DATE, 1, 'Excelente dia. Paseo tranquilo, cero tirones. Tank esta mas relajado con la rutina.', 480)
ON CONFLICT DO NOTHING;

-- ============================================================
-- RECETAS (3 de ejemplo)
-- ============================================================
INSERT INTO nutrition_recipes (id, title, description, category, is_therapeutic, health_tags, source_book, prep_time_min, difficulty, kcal_per_100g) VALUES
('00000000-0000-4000-a000-000000002001', 'Bowl BARF Clásico', 'Mezcla base de proteína muscular, hueso carnoso y vísceras con vegetales frescos.', 'diario', false, '{}', 'Sabor Perruno', 15, 'facil', 180.00),
('00000000-0000-4000-a000-000000002002', 'Helado de Hígado y Arándanos', 'Snack refrescante para dias calurosos. Rico en antioxidantes y hierro.', 'helado', false, '{}', 'Sabor Perruno', 10, 'facil', 95.00),
('00000000-0000-4000-a000-000000002003', 'Menú Renal Terapéutico', 'Dieta baja en fósforo para perros con problemas renales. Aprobada por Pet-Holística.', 'diario', true, ARRAY['renal', 'senior'], 'Pet-Holística', 20, 'medio', 150.00)
ON CONFLICT DO NOTHING;

-- Ingredientes de las recetas
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity_per_serving_g, ingredient_type) VALUES
-- Bowl BARF Clásico
('00000000-0000-4000-a000-000000002001', 'Pollo muslo con hueso', 200, 'hueso'),
('00000000-0000-4000-a000-000000002001', 'Corazón de res', 100, 'proteina'),
('00000000-0000-4000-a000-000000002001', 'Hígado de pollo', 50, 'viscera'),
('00000000-0000-4000-a000-000000002001', 'Zanahoria rallada', 80, 'vegetal'),
('00000000-0000-4000-a000-000000002001', 'Espinaca picada', 60, 'vegetal'),
('00000000-0000-4000-a000-000000002001', 'Aceite de salmón', 10, 'suplemento'),
-- Helado de Hígado y Arándanos
('00000000-0000-4000-a000-000000002002', 'Hígado de pollo', 100, 'viscera'),
('00000000-0000-4000-a000-000000002002', 'Arándanos', 50, 'vegetal'),
('00000000-0000-4000-a000-000000002002', 'Yogur natural sin azúcar', 80, 'otro'),
('00000000-0000-4000-a000-000000002002', 'Miel (opcional)', 10, 'otro'),
-- Menú Renal Terapéutico
('00000000-0000-4000-a000-000000002003', 'Pechuga de pavo molida', 150, 'proteina'),
('00000000-0000-4000-a000-000000002003', 'Calabaza cocida', 100, 'vegetal'),
('00000000-0000-4000-a000-000000002003', 'Arroz blanco cocido', 80, 'otro'),
('00000000-0000-4000-a000-000000002003', 'Clara de huevo cocida', 50, 'proteina'),
('00000000-0000-4000-a000-000000002003', 'Aceite de coco', 5, 'suplemento')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASEOS (3 paseos de los ultimos dias)
-- ============================================================
INSERT INTO walks (dog_id, start_time, end_time, duration_sec, pipi_count, popo_count, traffic_light, trigger_tags, stool_rating) VALUES
('00000000-0000-4000-a000-000000000100',
 CURRENT_DATE - INTERVAL '2 days' + TIME '08:00',
 CURRENT_DATE - INTERVAL '2 days' + TIME '08:35',
 2100, 2, 1, 'green', '{}', 3),
('00000000-0000-4000-a000-000000000100',
 CURRENT_DATE - INTERVAL '1 day' + TIME '07:30',
 CURRENT_DATE - INTERVAL '1 day' + TIME '08:05',
 2100, 1, 1, 'yellow', ARRAY['Motos', 'Ruidos Fuertes'], 4),
('00000000-0000-4000-a000-000000000100',
 CURRENT_DATE + TIME '08:00',
 CURRENT_DATE + TIME '08:30',
 1800, 2, 1, 'green', '{}', 3)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ETAPAS DE LA ACADEMIA (6 etapas)
-- ============================================================
INSERT INTO stages (id, title, description, "order", color_hex) VALUES
('00000000-0000-4000-a000-000000003001', 'Nivel Novato', 'Fundamentos del liderazgo canino', 1, '#2563EB'),
('00000000-0000-4000-a000-000000003002', 'Nivel Aprendiz', 'Comandos básicos de obediencia', 2, '#7C3AED'),
('00000000-0000-4000-a000-000000003003', 'Nivel Intermedio', 'Refuerzo de obediencia en la calle', 3, '#16A34A'),
('00000000-0000-4000-a000-000000003004', 'Nivel Avanzado', 'Trucos y habilidades avanzadas', 4, '#EA580C'),
('00000000-0000-4000-a000-000000003005', 'Nivel Experto', 'Agility y deporte canino', 5, '#DC2626'),
('00000000-0000-4000-a000-000000003006', 'Nivel Maestro', 'Perro de servicio y terapia', 6, '#7C3AED')
ON CONFLICT DO NOTHING;

-- Modulo 1.1: La Psicologia del Liderazgo (unico desbloqueado al inicio)
INSERT INTO modules (id, stage_id, title, description, "order", icon_name) VALUES
('00000000-0000-4000-a000-000000004001', '00000000-0000-4000-a000-000000003001', 'Psicología del Liderazgo', 'Aprende cómo piensa tu perro y cómo establecerte como su guía.', 1, 'Brain'),
('00000000-0000-4000-a000-000000004002', '00000000-0000-4000-a000-000000003001', 'Comunicación Canina', 'Lenguaje corporal y señales de calma.', 2, 'MessageCircle'),
('00000000-0000-4000-a000-000000004003', '00000000-0000-4000-a000-000000003001', 'Rutinas y Estructura', 'La importancia del horario en la conducta canina.', 3, 'Clock')
ON CONFLICT DO NOTHING;

-- Lecciones del Modulo 1.1 (8 lecciones)
INSERT INTO lessons (id, module_id, title, type, "order", content_json) VALUES
('00000000-0000-4000-a000-000000005001', '00000000-0000-4000-a000-000000004001', 'La mente del perro', 'theory', 1, '{"cards":[{"type":"text","content":"Los perros no entienden el mundo como nosotros. Viven en el presente y aprenden por asociación."},{"type":"text","content":"Cada acción tuya es una señal. Tu postura, tu tono de voz y tu energía le dicen a tu perro quién está a cargo."},{"type":"text","content":"El liderazgo no es dominancia. Es confianza, consistencia y comunicación clara."}],"check":{"question":"¿Cómo aprenden principalmente los perros?","options":["Por castigo","Por asociación y repetición","Leyendo nuestras emociones","Por instinto únicamente"],"correct":1},"celebration":{"message":"¡Primera lección completada! Has dado el primer paso para ser el guía que tu perro necesita."}}'),
('00000000-0000-4000-a000-000000005002', '00000000-0000-4000-a000-000000004001', 'El timing perfecto', 'minigame_reflejos', 2, '{"target_time_ms":600,"stimulus_delay":2000,"instructions":"Toca la pantalla cuando aparezca la huella. Un buen líder tiene reflejos rápidos."}'),
('00000000-0000-4000-a000-000000005003', '00000000-0000-4000-a000-000000004001', 'Energía y estado emocional', 'theory', 3, '{"cards":[{"type":"text","content":"Tu perro lee tu energía antes que tus palabras. Si estás ansioso, él se pone ansioso."},{"type":"text","content":"Antes de corregir a tu perro, revisa tu propio estado. Respira profundo y proyecta calma."},{"type":"text","content":"El American Bully es especialmente sensible a la energía de su dueño. Un líder calmado = un perro calmado."}],"check":{"question":"¿Qué debe hacer un líder antes de corregir a su perro?","options":["Gritar más fuerte","Revisar su propio estado emocional","Ignorar al perro","Usar la correa más fuerte"],"correct":1},"celebration":{"message":"¡Excelente! La calma empieza en ti."}}'),
('00000000-0000-4000-a000-000000005004', '00000000-0000-4000-a000-000000004001', 'El diccionario K-9', 'minigame_diccionario', 4, '{"words":["Junto","Quieto","Suelta","Ven","Mírame"],"prompts":[{"situation":"Quieres que tu perro camine pegado a tu pierna","correct_word":"Junto"},{"situation":"Tu perro tiene algo en la boca que no debe","correct_word":"Suelta"},{"situation":"Necesitas que se detenga completamente","correct_word":"Quieto"}],"rounds":5,"instructions":"Selecciona el comando correcto para cada situación"}'),
('00000000-0000-4000-a000-000000005005', '00000000-0000-4000-a000-000000004001', 'Refuerzo positivo vs castigo', 'theory', 5, '{"cards":[{"type":"text","content":"El refuerzo positivo crea un perro confiado. El castigo crea un perro temeroso."},{"type":"text","content":"Cada vez que tu perro hace algo bien y lo premias, esa conducta se fortalece."},{"type":"text","content":"Ignorar una conducta no deseada es más efectivo que castigarla. Sin atención, la conducta se extingue."}],"check":{"question":"¿Qué método fortalece una conducta deseada?","options":["Castigo","Ignorar","Refuerzo positivo","Regaño verbal"],"correct":2},"celebration":{"message":"Estás construyendo un vínculo basado en confianza, no en miedo."}}'),
('00000000-0000-4000-a000-000000005006', '00000000-0000-4000-a000-000000004001', 'Práctica: Sentado', 'practice_timer', 6, '{"duration_minutes":3,"exercise_name":"Sentado","instructions":"Practica el comando Sentado con tu perro. Usa un premio sobre su nariz y llévalo hacia atrás. Cuando se siente, premia y celebra."}'),
('00000000-0000-4000-a000-000000005007', '00000000-0000-4000-a000-000000004001', 'La consistencia es clave', 'theory', 7, '{"cards":[{"type":"text","content":"Si un día permites que tu perro se suba al sofá y al otro lo regañas, lo confundes."},{"type":"text","content":"Toda la familia debe seguir las mismas reglas. Un solo miembro inconsistente puede deshacer semanas de entrenamiento."},{"type":"text","content":"Crea un acuerdo familiar: qué puede y qué no puede hacer el perro. Escríbelo y cúmplelo."}],"check":{"question":"¿Por qué es importante la consistencia familiar?","options":["Porque el perro solo obedece a una persona","Porque reglas inconsistentes confunden al perro","Porque el perro es manipulador","No es importante"],"correct":1},"celebration":{"message":"¡Un hogar consistente es un hogar feliz para tu perro!"}}'),
('00000000-0000-4000-a000-000000005008', '00000000-0000-4000-a000-000000004001', 'Evaluación del Módulo', 'minigame_diccionario', 8, '{"words":["Liderazgo","Consistencia","Refuerzo positivo","Energía","Timing"],"prompts":[{"situation":"Base fundamental para que tu perro confíe en ti","correct_word":"Liderazgo"},{"situation":"Técnica que fortalece conductas deseadas","correct_word":"Refuerzo positivo"},{"situation":"Lo que tu perro lee antes que tus palabras","correct_word":"Energía"}],"rounds":5,"instructions":"Demuestra lo aprendido en este módulo"}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- INSIGNIAS
-- ============================================================
INSERT INTO badges (id, name, description, badge_type) VALUES
('00000000-0000-4000-a000-000000006001', 'Guía Consistente', 'Registraste 7 días seguidos de paseos', 'streak'),
('00000000-0000-4000-a000-000000006002', 'Semana Verde', 'Lograste 7 paseos en verde consecutivos', 'tracker'),
('00000000-0000-4000-a000-000000006003', 'Maestro del Liderazgo', 'Completaste el módulo Psicología del Liderazgo', 'academia')
ON CONFLICT DO NOTHING;

-- ============================================================
-- ALIMENTOS TOXICOS (30 toxicos + 10 seguros)
-- ============================================================
INSERT INTO toxic_foods (name, is_toxic, severity, explanation, symptoms) VALUES
('Uvas', true, 'alto', 'Las uvas y pasas pueden causar falla renal aguda en perros, incluso en pequeñas cantidades.', 'Vómito, diarrea, letargo, falla renal en 24-72h'),
('Cebolla', true, 'alto', 'Contiene tiosulfato que destruye los glóbulos rojos causando anemia hemolítica.', 'Debilidad, encías pálidas, orina oscura, letargo'),
('Ajo', true, 'alto', 'Igual que la cebolla pero más concentrado. 5g por kg ya es tóxico.', 'Anemia, vómito, diarrea, debilidad'),
('Chocolate', true, 'alto', 'Contiene teobromina. El chocolate oscuro es el más peligroso.', 'Hiperactividad, temblores, convulsiones, arritmia cardíaca'),
('Xilitol', true, 'mortal', 'Edulcorante artificial que causa liberación masiva de insulina e hipoglucemia fulminante.', 'Vómito, pérdida de coordinación, convulsiones, falla hepática'),
('Aguacate', true, 'medio', 'Contiene persina, tóxica para perros. La pulpa es menos tóxica que la cáscara y la semilla.', 'Vómito, diarrea, dificultad respiratoria'),
('Nueces de macadamia', true, 'alto', 'Altamente tóxicas. El mecanismo exacto se desconoce pero afecta el sistema nervioso.', 'Debilidad en patas traseras, temblores, hipertermia'),
('Masa cruda con levadura', true, 'alto', 'La levadura fermenta en el estómago produciendo alcohol y expandiéndose.', 'Distensión abdominal, intoxicación etílica, torsión gástrica'),
('Alcohol', true, 'mortal', 'Los perros son mucho más sensibles al etanol que los humanos.', 'Vómito, desorientación, coma, muerte por depresión respiratoria'),
('Cafeína', true, 'alto', 'Café, té, bebidas energéticas. Estimula el sistema nervioso central de forma peligrosa.', 'Hiperactividad, taquicardia, temblores, convulsiones'),
('Huesos cocidos', true, 'alto', 'Los huesos cocidos se astillan y pueden perforar el tracto digestivo.', 'Asfixia, perforación intestinal, obstrucción'),
('Leche y lácteos', true, 'bajo', 'La mayoría de perros adultos son intolerantes a la lactosa.', 'Diarrea, gases, malestar estomacal'),
('Nueces de Brasil', true, 'medio', 'Muy altas en grasas. Pueden causar pancreatitis.', 'Vómito, diarrea, dolor abdominal, pancreatitis'),
('Semillas de manzana', true, 'medio', 'Contienen cianuro. La pulpa de manzana sin semillas es segura.', 'Dificultad respiratoria, pupilas dilatadas, shock'),
('Tomate verde', true, 'medio', 'Los tomates verdes y la planta contienen solanina, tóxica para perros.', 'Problemas gastrointestinales, letargo, confusión'),
('Sal en exceso', true, 'medio', 'Grandes cantidades de sal causan intoxicación por sodio.', 'Sed excesiva, vómito, diarrea, temblores, convulsiones'),
('Setas silvestres', true, 'mortal', 'Muchas setas silvestres contienen toxinas que destruyen el hígado.', 'Vómito, diarrea, letargo, falla hepática fulminante'),
('Nuez moscada', true, 'alto', 'Contiene miristicina que causa alucinaciones y problemas neurológicos.', 'Desorientación, alucinaciones, taquicardia, convulsiones'),
('Ruibarbo', true, 'medio', 'Contiene oxalatos que pueden causar falla renal.', 'Vómito, diarrea, temblores, falla renal'),
('Coco y aceite de coco', true, 'bajo', 'En pequeñas cantidades puede ser tolerable, pero en exceso causa pancreatitis.', 'Diarrea, vómito, pancreatitis'),
('Carne cruda en exceso', true, 'bajo', 'Riesgo de bacterias como Salmonella y E. coli si no es de calidad para consumo humano.', 'Vómito, diarrea, fiebre, septicemia en casos graves'),
('Pescado crudo', true, 'medio', 'Puede contener parásitos y tiaminasa que destruye vitamina B1.', 'Deficiencia de tiamina, parásitos intestinales'),
('Huevo crudo', true, 'bajo', 'Riesgo de Salmonella y la clara contiene avidina que bloquea biotina.', 'Problemas de piel y pelo por deficiencia de biotina'),
('Embutidos procesados', true, 'medio', 'Altos en sodio, nitratos y conservadores artificiales.', 'Pancreatitis, obesidad, problemas renales a largo plazo'),
('Comida para gatos', true, 'medio', 'Demasiada proteína y grasa para el metabolismo canino.', 'Pancreatitis, obesidad, problemas digestivos'),
('Medicamentos humanos', true, 'mortal', 'Ibuprofeno, paracetamol y otros AINEs son extremadamente tóxicos.', 'Falla renal, úlceras gástricas, falla hepática, muerte'),
('Azúcar y dulces', true, 'medio', 'Contribuyen a obesidad, diabetes y problemas dentales.', 'Obesidad, caries, diabetes, pancreatitis'),
('Cítricos en exceso', true, 'bajo', 'Altos en ácido cítrico. Pequeñas cantidades son tolerables.', 'Irritación estomacal, vómito'),
('Hojas de ruibarbo', true, 'alto', 'Contienen oxalatos solubles altamente tóxicos.', 'Falla renal aguda, vómito, diarrea'),
('Moho', true, 'mortal', 'Micotoxinas que causan falla hepática fulminante. Nunca des comida con moho.', 'Temblores, convulsiones, falla hepática, muerte'),
-- Alimentos seguros
('Zanahoria', false, 'bajo', 'Excelente snack bajo en calorías. Rico en fibra y betacaroteno.', NULL),
('Manzana sin semillas', false, 'bajo', 'Buena fuente de fibra y vitamina C. Quitar semillas y corazón.', NULL),
('Arándanos', false, 'bajo', 'Ricos en antioxidantes. Excelentes como premio de entrenamiento.', NULL),
('Calabaza cocida', false, 'bajo', 'Excelente para la digestión. Ayuda tanto en diarrea como en estreñimiento.', NULL),
('Pollo hervido', false, 'bajo', 'Proteína magra. Base de la dieta blanda para perros con malestar estomacal.', NULL),
('Batata cocida', false, 'bajo', 'Rica en fibra y vitamina A. Muy digestible.', NULL),
('Pepino', false, 'bajo', 'Refrescante, bajo en calorías. Ideal para perros con sobrepeso.', NULL),
('Sandía sin semillas', false, 'bajo', 'Hidratante y baja en calorías. Retirar semillas y cáscara.', NULL),
('Yogur natural sin azúcar', false, 'bajo', 'Probiótico natural. Ayuda a la flora intestinal.', NULL),
('Huevo cocido', false, 'bajo', 'Excelente fuente de proteína y biotina. Siempre cocido, nunca crudo.', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DETOX 14 DIAS
-- ============================================================
INSERT INTO detox_days (day_number, title, instructions, warning) VALUES
(1, 'Ayuno parcial', 'Ofrece solo agua fresca durante la mañana. En la noche, sirve pollo hervido desmenuzado (sin sal ni condimentos) con un poco de calabaza cocida.', 'No prolongues el ayuno más de 12 horas en perros pequeños.'),
(2, 'Dieta blanda', 'Pollo hervido + calabaza cocida. 3 porciones pequeñas durante el día.', 'Observa las heces. Si hay diarrea, reduce la porción.'),
(3, 'Dieta blanda + zanahoria', 'Pollo hervido + calabaza + zanahoria rallada cocida. 3 porciones.', 'La zanahoria ayuda a endurecer las heces.'),
(4, 'Introducción de proteína', 'Agrega 20% de carne de res molida magra cocida. El resto sigue siendo pollo.', 'Primera proteína nueva. Observa reacciones alérgicas.'),
(5, 'Aumento de proteína', '40% carne de res + 60% pollo. Agrega una pizca de aceite de salmón.', 'El aceite de salmón aporta omega-3. No exceder.'),
(6, 'Introducción de vísceras', 'Agrega 10% de hígado de pollo cocido a la mezcla de hoy.', 'El hígado debe ser máximo 10% del plato.'),
(7, 'Mitad del camino', '50% carne de res, 40% pollo, 10% hígado. Agrega espinaca cocida picada.', '¡Una semana completada! Las heces deben estar mejorando.'),
(8, 'Introducción del hueso carnoso', 'Cambia el pollo hervido por alitas de pollo crudas (siempre supervisar). Resto de la dieta igual.', 'NUNCA hueso cocido. Solo crudo y carnoso.'),
(9, 'Variedad de vegetales', 'Agrega brócoli cocido picado a la mezcla. Reduce ligeramente la carne.', 'Nuevos vegetales = nuevos nutrientes.'),
(10, 'Menú BARF completo', 'Proteína muscular + hueso carnoso + vísceras + vegetales. Proporción 50/20/10/20.', 'Tu perro ya come BARF completo. Monitorea sus heces.'),
(11, 'Segunda proteína', 'Sustituye la carne de res por pavo molido. Observa tolerancia.', 'Variar proteínas evita alergias a largo plazo.'),
(12, 'Tercera proteína', 'Sustituye el pavo por cordero molido (si está disponible) o regresa a res+pollo.', 'El cordero es excelente para perros con alergias.'),
(13, 'Menú casi completo', 'Rotación de proteínas + hueso + vísceras + vegetales variados.', 'Tu perro ya tolera variedad de alimentos.'),
(14, '¡Transición completada!', 'Felicidades. Tu perro completó la transición a alimentación natural. Sigue variando proteínas y vegetales cada semana.', 'Registra siempre sus heces. Cualquier cambio drástico, regresa a dieta blanda 2 días.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RETOS SEMANALES
-- ============================================================
INSERT INTO weekly_challenges (title, description, fecha_inicio, fecha_fin) VALUES
('Junto en 5 días', 'Practica el comando Junto 10 minutos diarios. Cada día que practiques, márcalo como completado.', CURRENT_DATE, CURRENT_DATE + INTERVAL '4 days'),
('Paseo sin tirones', 'Logra 3 paseos consecutivos en verde esta semana. Registra cada paseo en el Tracker.', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 days'),
('Semana BARF', 'Prepara 5 recetas diferentes esta semana usando el Generador de Menús.', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PLANES DE SUSCRIPCION
-- ============================================================
INSERT INTO plans (name, price_cents, izipay_price_id, max_dogs, features, billing_interval) VALUES
('Pro Mensual', 1000, 'izipay_pro_monthly', 999, ARRAY['Perros ilimitados', 'Recetario completo (150 recetas)', 'Generador de menús', 'Reto Detox 14 días', 'Todas las etapas Academia', 'Gráficos avanzados', 'Soporte prioritario'], 'month'),
('Pro Anual', 9900, 'izipay_pro_annual', 999, ARRAY['Perros ilimitados', 'Recetario completo (150 recetas)', 'Generador de menús', 'Reto Detox 14 días', 'Todas las etapas Academia', 'Gráficos avanzados', 'Soporte prioritario'], 'year')
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTIFICACION DE PRUEBA
-- ============================================================
INSERT INTO notifications (user_id, mensaje) VALUES
('00000000-0000-4000-a000-000000000001', '¡Bienvenido a Dog Blis Club! Configura el perfil metabólico de Tank para empezar.')
ON CONFLICT DO NOTHING;
