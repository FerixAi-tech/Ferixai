import Script from "next/script";
import { GOOGLE_ADS_ID, isGoogleAdsTagEnabled } from "@/lib/google-ads/conversion";

/**
 * Google Ads global site tag (gtag.js). Loaded once in root layout on all pages.
 * Purchase conversions are handled separately when Stripe payment is verified.
 */
export default function GoogleAdsTag() {
  if (!isGoogleAdsTagEnabled()) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
if (!window.__ferixGoogleAdsConfigured) {
  gtag('js', new Date());
  gtag('config', '${GOOGLE_ADS_ID}');
  window.__ferixGoogleAdsConfigured = true;
}
        `}
      </Script>
    </>
  );
}
