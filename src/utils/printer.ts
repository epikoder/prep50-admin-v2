import { RefObject } from "react";

const printer = (el: HTMLElement): string | void => {
    if (!el) {
        return "Noting to print";
    }
    const iframe = document.createElement("iframe");
    iframe.id = `iframe-printer-${new Date().getTime()}`;
    document.body.append(iframe);

    iframe.style.zIndex = "9999999999";
    iframe.style.position = "fixed";
    iframe.style.top = "-999999px";
    iframe.style.height = "297mm";
    iframe.style.width = "210mm";
    iframe.style.backgroundColor = "white";

    iframe.contentDocument!.body.innerHTML = "";
    iframe.contentDocument!.body.append(el.cloneNode(true));
    // Copy styles from parent document
    Array.from(document.styleSheets).forEach((styleSheet) => {
        if (styleSheet.href) {
            iframe.contentWindow!.document.write(
                '<link rel="stylesheet" href="' + styleSheet.href + '">',
            );
        } else {
            // If the stylesheet is inline, copy the rules
            var style = document.createElement("style");
            Array.from(styleSheet.cssRules).forEach((rule) => {
                style.appendChild(document.createTextNode(rule.cssText));
            });
            iframe.contentWindow!.document.head.appendChild(style);
        }
    });

    setTimeout(async () => {
        iframe.contentWindow?.print();
        document.removeChild(iframe);
    }, 1000);

};

export default printer;
