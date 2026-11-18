interface ImportMetaEnv {
  readonly SHOW_DRAFTS: boolean;
}

declare namespace App {
  interface Locals {
    peeks?: Set<string>;
  }
}
