import type { Props } from "astro";
import IconMail from "./assets/icons/IconMail.svg";
import IconGitHub from "./assets/icons/IconGitHub.svg";
import IconBrandX from "./assets/icons/IconBrandX.svg";
import IconLinkedin from "./assets/icons/IconLinkedin.svg";
import IconWhatsapp from "./assets/icons/IconWhatsapp.svg";
import IconFacebook from "./assets/icons/IconFacebook.svg";
import IconTelegram from "./assets/icons/IconTelegram.svg";
import IconPinterest from "./assets/icons/IconPinterest.svg";
import { SITE } from "./config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/0xnayuta",
    linkTitle: `${SITE.author} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "X",
    href: "/",
    linkTitle: `${SITE.author} on X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "/",
    linkTitle: `${SITE.author} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "Mail",
    href: "mailto:wangyan.life@outlook.com",
    linkTitle: `给 ${SITE.author} 发送电子邮件`,
    icon: IconMail,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `分享此文章到 WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `分享此文章到 Facebook `,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `分享此文章到 X`,
    icon: IconBrandX,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `分享此文章到 Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `分享此文章到 Pinterest`,
    icon: IconPinterest,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `通过电子邮件分享此文章`,
    icon: IconMail,
  },
] as const;
