export type ApiFieldType = 'text' | 'password' | 'select';
export type ApiAccessType = 'Pública' | 'Privada';
export type ApiCostType = 'gratis' | 'freemium' | 'pagado';
export type ApiStatus = 'untested' | 'testing' | 'success' | 'error' | 'limit';

export interface ApiFieldOption {
  value: string;
  label: string;
}

export interface ApiField {
  id: string;
  label: string;
  type: ApiFieldType;
  description: string;
  getFrom: string;
  accessType: ApiAccessType;
  cost: ApiCostType;
  options?: ApiFieldOption[];
  testEndpoint?: string;
  testMethod?: string;
}

export interface ApiApp {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  website: string;
  fields: ApiField[];
}

export interface ApiCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  apps: ApiApp[];
}

export interface ApiKeyValue {
  key_name: string;
  key_value: string;
  updated_at?: string;
}

export interface ApiIdeasData {
  title: string;
  categories: { emoji: string; title: string; items: string[] }[];
}
