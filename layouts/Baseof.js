import config from "@config/config.json";
import social from "@config/social.json";
import { plainify } from "@lib/utils/textConverter";
import Footer from "@partials/Footer";
import Header from "@partials/Header";
import Head from "next/head";
import { useRouter } from "next/router";

const Base = ({
  title,
  meta_title,
  description,
  image,
  noindex,
  canonical,
  children,
}) => {
  const { meta_image, meta_author, meta_description } = config.metadata;
  const { base_url, title: siteTitle } = config.site;
  const router = useRouter();

  const derivedBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof base_url === "string" && base_url.startsWith("http")
      ? base_url
      : social.website || "https://example.com");

  const currentPath = router.asPath === "/" ? "" : router.asPath;
  const currentUrl = `${derivedBaseUrl}${currentPath}`;
  const sameAs = Object.values(social).filter(
    (value) => typeof value === "string" && value.startsWith("http")
  );

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: meta_author,
    url: derivedBaseUrl,
    image: `${derivedBaseUrl}${meta_image}`,
    sameAs,
    jobTitle: "Senior Full Stack Developer & AI Specialist",
    knowsAbout: [
      "Next.js",
      "React",
      "Firebase",
      "Machine Learning",
      "Technical SEO",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: derivedBaseUrl,
    inLanguage: "vi",
    author: {
      "@type": "Person",
      name: meta_author,
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteTitle,
    url: derivedBaseUrl,
    description: meta_description,
    areaServed: "Global",
    availableLanguage: ["Vietnamese", "English"],
    provider: {
      "@type": "Person",
      name: meta_author,
    },
  };

  return (
    <>
      <Head>
        {/* title */}
        <title>
          {plainify(
            meta_title ? meta_title : title ? title : config.site.title
          )}
        </title>

        {/* canonical url */}
        {canonical && <link rel="canonical" href={canonical} itemProp="url" />}

        {/* noindex robots */}
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* meta-description */}
        <meta
          name="description"
          content={plainify(description ? description : meta_description)}
        />

        {/* author from config.json */}
        <meta name="author" content={meta_author} />

        {/* og-title */}
        <meta
          property="og:title"
          content={plainify(
            meta_title ? meta_title : title ? title : config.site.title
          )}
        />

        {/* og-description */}
        <meta
          property="og:description"
          content={plainify(description ? description : meta_description)}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={currentUrl}
        />

        {/* twitter-title */}
        <meta
          name="twitter:title"
          content={plainify(
            meta_title ? meta_title : title ? title : config.site.title
          )}
        />

        {/* twitter-description */}
        <meta
          name="twitter:description"
          content={plainify(description ? description : meta_description)}
        />

        {/* og-image */}
        <meta
          property="og:image"
          content={`${derivedBaseUrl}${image ? image : meta_image}`}
        />

        {/* twitter-image */}
        <meta
          name="twitter:image"
          content={`${derivedBaseUrl}${image ? image : meta_image}`}
        />
        <meta name="twitter:card" content="summary_large_image" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </Head>
      <Header />
      {/* main site */}
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Base;
