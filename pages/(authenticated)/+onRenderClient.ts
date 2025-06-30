import { AUTH_KEY } from "@src/utils/auth";
import { PageContext } from "vike/types";
import { redirect } from "vike/abort";

import "@src/extensions/impl";
import "@assets/css/styles.css";
import "@assets/css/toast.css";
import "@assets/css/select.module.css";

export default function __onData(context: PageContext) {
    const userString = sessionStorage.getItem(AUTH_KEY + "_user");
    const authString = sessionStorage.getItem(AUTH_KEY);
    if (!authString || !userString) {
        throw redirect("/login");
    }

    const u = JSON.parse(userString) as User;
    context.config.user = u;
}
