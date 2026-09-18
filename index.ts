import { AntigravityCLIOAuthPlugin } from "./src/plugin.js";

export default AntigravityCLIOAuthPlugin;

export {
  AntigravityCLIOAuthPlugin,
  GoogleOAuthPlugin,
} from "./src/plugin.js";

export {
  authorizeAntigravity,
  exchangeAntigravity,
} from "./src/antigravity/oauth.js";

export type {
  AntigravityAuthorization,
  AntigravityTokenExchangeResult,
} from "./src/antigravity/oauth.js";
