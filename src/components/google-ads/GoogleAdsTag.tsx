import { GOOGLE_ADS_ID, isGoogleAdsTagEnabled } from "@/lib/google-ads/conversion";

/**
 * Google Ads global site tag in the document head so Ads diagnostics can
 * detect AW-… on first HTML parse (not after client hydration).
 */
export default function GoogleAdsTag() {
  if (!isGoogleAdsTagEnabled()) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
if (!window.__ferixGoogleAdsConfigured) {
  gtag('js', new Date());
  gtag('config', '${GOOGLE_ADS_ID}', {
    conversion_linker: true,
    allow_enhanced_conversions: true
  });
  window.__ferixGoogleAdsConfigured = true;
}
          `,
        }}
      />
    </>
  );
}
