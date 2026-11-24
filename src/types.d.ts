// Ambient type declarations for the strict TS conversion.
//
// This file is a module (side-effect imports + `export {}`) so the
// `declare module` blocks below are augmentations that MERGE into the real
// library typings instead of replacing them.

import 'axios';
import 'react';

// ---------------------------------------------------------------------------
// axios: the runtime `InterceptorManager` exposes a public `handlers` array
// (used by src/api/client.test.tsx to invoke the registered request
// interceptor), but axios's shipped typings only declare use/eject/clear.
// This augmentation describes the actual runtime shape.
// ---------------------------------------------------------------------------
declare module 'axios' {
  export interface AxiosInterceptorHandler<V> {
    fulfilled: (value: V) => V | Promise<V>;
    rejected?: ((error: unknown) => unknown) | null;
    synchronous?: boolean;
    when?: string;
  }

  export interface AxiosInterceptorManager<V> {
    handlers: Array<AxiosInterceptorHandler<V> | null>;
  }
}

// ---------------------------------------------------------------------------
// react: two JSX attributes the components render as-written are not in
// @types/react's HTMLAttributes:
//   - `class` (React <ul class=...> in ReactionDisplay/Reaction — kept
//     verbatim because the conversion forbids runtime changes)
//   - `index` (ReadOnlyRankItem's <div id index=...>)
// ---------------------------------------------------------------------------
declare module 'react' {
  interface HTMLAttributes<T> {
    class?: string;
    index?: number;
  }

  interface InputHTMLAttributes<T> {
    /** rendered as-is by React (case-insensitive HTML attribute) */
    minlength?: string;
  }
}

declare global {
  // Shared shape of the reaction presets (👍/❤️/😂/😮/😢/😡) used by
  // Reaction, ReactionDisplay and ReactionPicker.
  interface ReactionConfig {
    emoji: string;
    label: string;
    color: string;
  }
}

export {};
