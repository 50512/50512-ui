import type { StatusKeysType } from "../utils/statusPagesConfig";

export interface AppShellProps {
  title: string;
  status?: StatusKeysType;
  barLabel?: string;
  lang?: string;
  showStatusBar?: boolean;
}
