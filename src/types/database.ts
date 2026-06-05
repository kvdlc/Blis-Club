export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ActivityLevel = "sedentario" | "moderado" | "activo" | "atletico";
export type RecipeCategory = "diario" | "snack" | "helado" | "pastel" | "croquetas";
export type RecipeDifficulty = "facil" | "medio" | "avanzado";
export type LessonType = "theory" | "minigame_reflejos" | "minigame_diccionario" | "practice_timer";
export type TrafficLight = "green" | "yellow" | "red";
export type BadgeTypeVal = "academia" | "tracker" | "streak";
export type SeverityLevel = "bajo" | "medio" | "alto" | "mortal";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";
export type MedicationStatus = "active" | "completed" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  whatsapp: string | null;
  timezone: string | null;
  has_seen_tutorial?: boolean;
  created_at: string;
}

export interface Dog {
  id: string;
  owner_id: string;
  nombre: string;
  raza: string;
  edad_meses: number;
  fecha_nacimiento: string | null;
  peso_kg: number;
  tamano: string | null;
  objetivo_principal: string | null;
  foto_url: string | null;
  breed_image_url: string | null;
  created_at: string;
  is_lost?: boolean;
  lost_since?: string | null;
  lost_location?: string | null;
  lost_notes?: string | null;
  poster_title?: string | null;
  poster_photo_url?: string | null;
  poster_contact?: string | null;
  poster_reward_amount?: string | null;
}

export interface DailyLog {
  id: string;
  dog_id: string;
  fecha: string;
  nivel_estres: number | null;
  notas_conducta: string | null;
  comida_gramos: number | null;
  created_at: string;
}

export interface DogMetabolicProfile {
  id: string;
  dog_id: string;
  activity_level: ActivityLevel;
  allergies: string[];
  medical_conditions: string[];
  feeding_pct: number;
  custom_meat_pct: number;
  custom_bone_pct: number;
  custom_organ_pct: number;
  custom_veggie_pct: number;
}

export interface NutritionRecipe {
  id: string;
  title: string;
  description: string | null;
  category: RecipeCategory;
  image_url: string | null;
  video_url: string | null;
  is_therapeutic: boolean;
  health_tags: string[];
  source_book: string | null;
  prep_time_min: number | null;
  difficulty: RecipeDifficulty;
  kcal_per_100g: number | null;
  is_detox: boolean;
  protein_type: string | null;
  breed_sizes: string[];
  benefits: string[];
  storage_instructions: string | null;
  created_at: string;
}

export interface UserFavoriteRecipe {
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface UserHiddenRecipe {
  user_id: string;
  recipe_id: string;
  reason: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity_per_serving_g: number;
  ingredient_type: "proteina" | "hueso" | "viscera" | "vegetal" | "suplemento" | "otro";
  unit_type: string;
  unit_weight_g: number;
  display_unit: string | null;
}

export interface Walk {
  id: string;
  dog_id: string;
  start_time: string;
  end_time: string | null;
  duration_sec: number | null;
  pipi_count: number;
  popo_count: number;
  traffic_light: TrafficLight | null;
  trigger_tags: string[];
  stool_rating: number | null;
}

export interface Stage {
  id: string;
  title: string;
  description: string | null;
  order: number;
  color_hex: string;
}

export interface Module {
  id: string;
  stage_id: string;
  title: string;
  description: string | null;
  order: number;
  icon_name: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: LessonType;
  order: number;
  content_json: Record<string, unknown>;
  video_url: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  completed_at: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  badge_type: BadgeTypeVal;
  module_id: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface ToxicFood {
  id: string;
  name: string;
  is_toxic: boolean;
  severity: SeverityLevel;
  explanation: string | null;
  symptoms: string | null;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  link_whatsapp: string | null;
}

export interface BARFResult {
  total: number;
  meat: number;
  bone: number;
  organ: number;
  veggie: number;
}

export interface DetoxDay {
  day_number: number;
  title: string;
  instructions: string;
  warning: string | null;
}

export interface DetoxProgress {
  id: string;
  dog_id: string;
  day_number: number;
  completed: boolean;
  completed_at: string | null;
}

export interface ShoppingListItem {
  id: string;
  user_id: string;
  ingredient_name: string;
  quantity_g: number | null;
  checked: boolean;
  week_start: string | null;
}

export interface Plan {
  id: string;
  name: string;
  price_cents: number;
  izipay_price_id: string | null;
  max_dogs: number;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  izipay_subscription_id: string | null;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface AgilitySession {
  id: string;
  dog_id: string;
  fecha: string;
  activity_type: string;
  duration_min: number;
  circuit_time_seconds: number | null;
  notes: string | null;
  session_type_id: string | null;
  lesson_id: string | null;
  difficulty_level: "principiante" | "intermedio" | "avanzado" | null;
  fouls_total: number;
  clean_run: boolean;
  time_fault: boolean;
  video_url: string | null;
  obstacles_completed_count: number;
  raw_time_seconds: number | null;
  net_time_seconds: number | null;
}

export interface AgilitySessionType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  standard_obstacle_count: number | null;
  has_contact_zones: boolean;
  has_time_limit: boolean;
  created_at: string;
}

export interface AgilityFoulType {
  id: string;
  name: string;
  slug: string;
  default_time_penalty_seconds: number;
  is_disqualification: boolean;
  description: string | null;
  created_at: string;
}

export interface AgilityObstacle {
  id: string;
  name: string;
  category: string;
  icon_name: string | null;
  is_custom: boolean;
  suggested_by_user_id: string | null;
  approved_by_admin: boolean;
  created_at: string;
}

export interface AgilitySessionObstacle {
  id: string;
  session_id: string;
  obstacle_id: string;
  used: boolean;
  fouls_count: number;
  notes: string | null;
  created_at: string;
  obstacle?: AgilityObstacle | null;
}

export interface AgilitySessionPenaltySetting {
  id: string;
  session_id: string;
  foul_type_id: string;
  penalty_seconds: number;
  created_at: string;
  foul_type?: AgilityFoulType | null;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  image_url: string | null;
  duration_min: number | null;
  created_at: string;
}

export interface RecipeNutritionFacts {
  id: string;
  recipe_id: string;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  moisture_g: number | null;
  ash_g: number | null;
  calcium_mg: number | null;
  phosphorus_mg: number | null;
  iron_mg: number | null;
  zinc_mg: number | null;
  vitamin_a_ui: number | null;
  vitamin_d_ui: number | null;
  vitamin_e_mg: number | null;
  omega3_g: number | null;
  omega6_g: number | null;
  created_at: string;
}

export interface DogMealSlot {
  id: string;
  dog_id: string;
  slot_index: number;
  label: string;
  time_of_day: string;
  active: boolean;
  created_at: string;
}

export type MealStatus = "scheduled" | "fed" | "skipped" | "suggested";

export interface MealSchedule {
  id: string;
  dog_id: string;
  recipe_id: string | null;
  fecha: string;
  meal_slot_index: number;
  status: MealStatus;
  gramos: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DogVaccine {
  id: string;
  dog_id: string;
  vaccine_name: string;
  vaccine_group: string;
  dose_number: number;
  date_administered: string | null;
  next_due_date: string | null;
  brand: string | null;
  cost_usd: number | null;
  vet_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface DogVetVisit {
  id: string;
  dog_id: string;
  fecha: string;
  motivo: string;
  diagnostico: string | null;
  vet_name: string | null;
  vet_id: string | null;
  peso_kg: number | null;
  vet_rating: number | null;
  notas: string | null;
  created_at: string;
}

export interface DogMedication {
  id: string;
  dog_id: string;
  medication_name: string;
  dosage: string | null;
  start_date: string;
  end_date: string | null;
  doses_per_day: number;
  dose_hours: string[];
  status: MedicationStatus;
  notes: string | null;
  created_at: string;
}

export interface DogMedicationLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken: boolean;
  taken_at: string | null;
  skipped_reason: string | null;
  created_at: string;
}

export interface DogWeightHistory {
  id: string;
  dog_id: string;
  peso_kg: number;
  fecha: string;
  notas: string | null;
  foto_url: string | null;
  created_at: string;
}

export interface TrustedVet {
  id: string;
  user_id: string;
  name: string;
  clinic_name: string | null;
  phone: string | null;
  address: string | null;
  specialty: string | null;
  notes: string | null;
  avg_rating: number;
  total_visits: number;
  created_at: string;
}

export interface ShortLink {
  id: string;
  slug: string;
  target_url: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  level: number;
  reward_granted: boolean;
  cash_reward_usd: number;
  subscription_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface ReferralCommission {
  id: string;
  user_id: string;
  referral_id: string;
  level: number;
  commission_cents: number;
  status: string;
  created_at: string;
}

export interface ReferralNode {
  id: string;
  referralCode: string;
  level: number;
  status: string;
  cashRewardUsd: number;
  createdAt: string;
  paidAt: string | null;
  endedAt: string | null;
  user: {
    id: string;
    code: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  subscription: {
    status: string;
    periodEnd: string | null;
  } | null;
  children?: ReferralNode[];
}

export interface CommissionsSummary {
  level1Cents: number;
  level2Cents: number;
  level3Cents: number;
  totalCents: number;
}

export interface UserApp {
  id: string;
  user_id: string;
  app_slug: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
}

export interface AgilityCircuit {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  session_type_id: string | null;
  difficulty_level: "principiante" | "intermedio" | "avanzado" | null;
  standard_obstacles: Array<{ obstacle_id: string; order: number }>;
  is_active: boolean;
  is_visible: boolean;
  application_id: string | null;
  created_at: string;
}

export interface AgilityCustomCircuit {
  id: string;
  user_id: string;
  dog_id: string | null;
  name: string;
  description: string | null;
  session_type_id: string | null;
  difficulty_level: "principiante" | "intermedio" | "avanzado" | null;
  obstacles: Array<{ obstacle_id: string; order: number }>;
  is_active: boolean;
  is_visible: boolean;
  suggested_to_admin: boolean;
  created_at: string;
}

export interface PurchaseStore {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  color: string | null;
  created_at: string;
}

export interface ShoppingPurchase {
  id: string;
  user_id: string;
  ingredient_name: string;
  store_id: string | null;
  quantity: number | null;
  quantity_unit: string;
  currency: string;
  price_total: number | null;
  price_per_kg: number | null;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  store?: PurchaseStore | null;
}
