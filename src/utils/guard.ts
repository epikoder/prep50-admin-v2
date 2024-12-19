export { guardClient };
import { AUTH_KEY } from "./auth";
import type { PageContextClient } from "vike/types";
import { navigate } from "vike/client/router";
import { postgrest, WithAuth } from "./postgrest";

// https://github.com/vikejs/vike/issues/1916
// wka
const guardClient = (
  context: PageContextClient,
  onRenderClient: (pageContext: PageContextClient) => void,
) => {
  if (context.urlPathname == "/login") {
    return onRenderClient(context);
  }

  const userString = sessionStorage.getItem(AUTH_KEY + "_user");

  const authString = sessionStorage.getItem(AUTH_KEY);
  if (!authString || !userString) {
    navigate("/login");
    return;
  }

  const u = JSON.parse(userString) as User;
  context.config.user = u;
  context.isHydration = false;
  onRenderClient(context); // Render client
};
