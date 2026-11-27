export interface ConfigurationLine {
  slot: string;
  name: string;
  part: string;
  detail: string;
  quantity: number;
  image?: string;
}

export interface AssemblyConfiguration {
  choices: string[];
  title: string;
  fit: string;
  image: string;
  guide: string;
  parts: ConfigurationLine[];
  hardware: ConfigurationLine[];
}

export interface ConfigurationSet {
  groups: { label: string; options: { value: string; label: string }[] }[];
  configurations: AssemblyConfiguration[];
  initial: AssemblyConfiguration;
}
