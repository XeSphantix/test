import { registerAs } from '@nestjs/config';

export interface AppConfig {
  name: string;
  port: number;
  env: string;
  url: string;
}

export default registerAs('app', (): AppConfig => ({
  name: process.env.APP_NAME ?? 'PropertyManager',
  port: process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000,
  env: process.env.APP_ENV ?? 'development',
  url: process.env.APP_URL ?? 'http://localhost:3000',
}));
