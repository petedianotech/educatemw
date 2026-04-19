declare const GEMINI_API_KEY: string;
declare const OPENROUTER_API_KEY: string;
declare const PRODUCTION_API_URL: string;
declare const ADMIN_TEAM_PASSWORD: string;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
