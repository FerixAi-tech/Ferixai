import Script from "next/script";

const CRISP_WEBSITE_ID = "510601e9-a9e2-4c38-a8a6-f36543f62a89";

export default function CrispChat() {
  return (
    <Script id="crisp-live-chat" strategy="lazyOnload">
      {`
        window.$crisp = window.$crisp || [];
        window.CRISP_WEBSITE_ID = "${CRISP_WEBSITE_ID}";
        window.CRISP_RUNTIME_CONFIG = { locale: "en" };
        (function () {
          var d = document;
          var s = d.createElement("script");
          s.src = "https://client.crisp.chat/l.js";
          s.async = 1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
      `}
    </Script>
  );
}
