import { Failable } from "@baza/shared-types";

export type SettingsSchema = SettingsSection[];

export interface SettingsSection {
  title: string;
  settings: Settings[];
}

export type Settings =
  | ToggleSetting
  | SelectSetting
  | InputSetting
  | ButtonSetting;

export enum SettingsType {
  TOGGLE = "toggle",
  SELECT = "select",
  INPUT = "input",
  BUTTON = "button",
}

export interface BaseSetting {
  id: string;
  label: string;
  description?: string;
  type: SettingsType;
  visibilityFn?: () => boolean;
}

export interface ToggleSetting extends BaseSetting {
  type: SettingsType.TOGGLE;
  value: boolean;
  onChangeFn: (value: boolean) => Failable<SettingsError>;
  defaultValue?: boolean;
}

export interface SelectSetting extends BaseSetting {
  type: SettingsType.SELECT;
  options: string[];
  value: string;
  onChangeFn: (value: string) => Failable<SettingsError>;
  defaultValue?: string;
}

export interface InputSetting extends BaseSetting {
  type: SettingsType.INPUT;
  value: string;
  onChangeFn: (value: string) => Failable<SettingsError>;
  placeholder?: string;
  defaultValue?: string;
}

export interface ButtonSetting extends BaseSetting {
  type: SettingsType.BUTTON;
  onClickFn: () => Failable<SettingsError>;
}

export interface SettingsError {
  message: string;
}
