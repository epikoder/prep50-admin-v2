import { onRenderClient } from "vike-react/__internal/integration/onRenderClient";
import { PageContextClient } from "vike/types";

import "../src/extensions/impl";
import "../assets/css/styles.css"
import "../assets/css/toast.css"
import "../assets/css/select.module.css"

import { guardClient } from "../src/utils/guard";

export default function (pageContext: PageContextClient) {
    guardClient(pageContext, onRenderClient);
}
