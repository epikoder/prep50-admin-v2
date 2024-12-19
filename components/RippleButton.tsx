import { clientOnly } from "vike-react/clientOnly";

export default clientOnly(() => import("./RippleButton.client"));
