export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ActivityLevel = "sedentario" | "moderado" | "activo" | "atletico";
export type RecipeCategory = "diario" | "snack" | "helado" | "pastel";
export type RecipeDifficulty = "facil" | "medio" | "avanzado";
export type LessonType = "theory" | "minigame_reflejos" | "minigame_diccionario" | "practice_timer";
export type TrafficLight = "green" | "yellow" | "red";
export type BadgeTypeVal = "academia" | "tracker" | "streak";
export type SeverityLevel = "bajo" | "medio" | "alto" | "mortal";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Dog {
  id: string;
  owner_id: string;
  nombre: string;
  raza: string;
  edad_meses: number;
  peso_kg: number;
  objetivo_principal: string | null;
  foto_url: string | null;
  created_at: string;
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
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity_per_serving_g: number;
  ingredient_type: "proteina" | "hueso" | "viscera" | "vegetal" | "suplemento" | "otro";
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
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}
