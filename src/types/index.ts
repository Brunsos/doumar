export interface Service {
  title: string;
  description: string;
}

export interface Update {
  date: string;
  content: string[];
}

export interface NavLink {
  href: string;
  label: string;
}

export interface IntakeFormData {
  firstName: string;
  lastName: string;
  consent: boolean;
}
