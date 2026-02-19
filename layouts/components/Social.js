import {
  IoCall,
  IoGlobeOutline,
  IoLocation,
  IoLogoBehance,
  IoLogoBitbucket,
  IoLogoCodepen,
  IoLogoDiscord,
  IoLogoDribbble,
  IoLogoFacebook,
  IoLogoFoursquare,
  IoLogoGithub,
  IoLogoGitlab,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoMedium,
  IoLogoPinterest,
  IoLogoReddit,
  IoLogoRss,
  IoLogoSkype,
  IoLogoSlack,
  IoLogoSnapchat,
  IoLogoSoundcloud,
  IoLogoStackoverflow,
  IoLogoTiktok,
  IoLogoTumblr,
  IoLogoTwitter,
  IoLogoVimeo,
  IoLogoVk,
  IoLogoWhatsapp,
  IoLogoYoutube,
  IoMail,
} from "react-icons/io5";

const iconMap = {
  facebook: IoLogoFacebook,
  stackoverflow: IoLogoStackoverflow,
  twitter: IoLogoTwitter,
  instagram: IoLogoInstagram,
  youtube: IoLogoYoutube,
  linkedin: IoLogoLinkedin,
  github: IoLogoGithub,
  gitlab: IoLogoGitlab,
  discord: IoLogoDiscord,
  slack: IoLogoSlack,
  medium: IoLogoMedium,
  codepen: IoLogoCodepen,
  bitbucket: IoLogoBitbucket,
  dribbble: IoLogoDribbble,
  behance: IoLogoBehance,
  pinterest: IoLogoPinterest,
  soundcloud: IoLogoSoundcloud,
  tumblr: IoLogoTumblr,
  reddit: IoLogoReddit,
  vk: IoLogoVk,
  whatsapp: IoLogoWhatsapp,
  snapchat: IoLogoSnapchat,
  vimeo: IoLogoVimeo,
  tiktok: IoLogoTiktok,
  foursquare: IoLogoFoursquare,
  skype: IoLogoSkype,
  website: IoGlobeOutline,
  rss: IoLogoRss,
};

const cleanUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.trim();
};

const Social = ({ source, className }) => {
  const {
    email,
    phone,
    address,
    ...rest
  } = source;

  const entries = Object.entries(rest)
    .map(([key, value]) => ({ key, value: cleanUrl(value) }))
    .filter(({ key, value }) => iconMap[key] && value);

  return (
    <ul className={className}>
      {entries.map(({ key, value }) => {
        const Icon = iconMap[key];
        return (
          <li className="inline-block" key={key}>
            <a
              aria-label={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              <Icon />
            </a>
          </li>
        );
      })}

      {email && (
        <li className="inline-block" key="email">
          <a aria-label="email" href={`mailto:${email}`}>
            <IoMail />
          </a>
        </li>
      )}

      {phone && (
        <li className="inline-block" key="phone">
          <a aria-label="telephone" href={`tel:${phone}`}>
            <IoCall />
          </a>
        </li>
      )}

      {address && (
        <li className="inline-block" key="address">
          <a
            aria-label="location"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              address
            )}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <IoLocation />
          </a>
        </li>
      )}
    </ul>
  );
};

export default Social;
