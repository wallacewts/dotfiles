import Console from "../../consolevp";
import { generateQueryWithTracking } from "./utils";
import { setPostMassage } from "./services";
import { sendTracking } from "../../services";
import consolevp from "../../consolevp";
const PLATFORM = process.env.PLATFORM || "chrome";

export default function tracking (product = {}, store = {}, cache = { timeoutcache: 1, trackingtimeout: 5, isAuto: false }, source = "vigia_extensao_grafico") {
    try {
        let link = product.deeplink ? product.deeplink : store.link;
        if (product.deeplink) {
            link = generateQueryWithTracking({
                deeplink: link,
                raw: product.raw || product.title,
                source,
                store: store.name
            });
        }
        if (!link) throw new Error();
        const consoleArgs = {
            link,
            tracking: store.tracking,
            trackingBackougrnd: ((!store.trackingiframe || PLATFORM == "firefox") && !cache.isAuto),
            trackingImg: (store.trackingimg && store.link) || (cache.isAuto && store.kgatig && store.link)
        };
        consolevp(`Informações sobre o tracking: ${JSON.stringify(consoleArgs, null, 4)}`);

        if (!store.tracking) throw new Error();

        link = link.replace(/^http?:/g, "https:");
        setPostMassage({
            storeid: store.ref,
            type: "registertrackingbystoreid"
        });

        if ((!store.trackingiframe || PLATFORM == "firefox") && !cache.isAuto) {
            return setPostMassage({
                link,
                storeid: store.ref,
                cache: (parseInt(store.timeoutcache) || parseInt(cache.timeoutcache || 1)),
                timeout: (parseInt(store.trackingtimeout) || parseInt(cache.trackingtimeout || 5)),
                type: "tracking",
                fetch: store.trackingfetch
            });
        }
        if (PLATFORM == "firefox") store.trackingimg = true;

        try {
            if ((store.trackingimg && store.link) || (cache.isAuto && store.kgatig && store.link)) {
                new Image().src = store.link;
                sendTracking({ storeid: store.ref });
            }
            else throw new Error();

        } catch (error) {
            var element = document.querySelector("#__vpe-pix");
            if (!element && PLATFORM != "firefox") {
                sendTracking({ storeid: store.ref });
                try {
                    var s = document.createElement("iframe");
                    s.id = "__vpe-pix";
                    s.src = link;
                    s.width = window.innerWidth.toString() + "px";
                    s.height = window.innerHeight.toString() + "px";
                    s.style.position = "absolute";
                    s.style.display = "block";
                    s.style.top = "-999999px";
                    s.style.left = "-999999px";

                    if (/americanas/.test(window.location.href) || /submarino/.test(window.location.href) || /shoptime/.test(window.location.href))
                        s.sandbox = "allow-same-origin";
                    else
                        s.sandbox = "allow-scripts allow-same-origin";

                    document.body.appendChild(s);
                } catch (e) {
                    Console(`Erro ao fazer tracking ${error.stack.toString()}`, true);
                }
            }
        }
    } catch (error) {
        Console(`Erro ao fazer tracking ${error.stack.toString()}`, true);
    }
}
