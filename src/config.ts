export const SITE = {
  website: "https://0xnayuta.github.io", // 部署后的网站地址
  author: "Izayoi Nayuta",
  profile: "https://github.com/0xnayuta",
  desc: "一个极简、响应式且对 SEO 友好的 Astro 博客主题。",
  title: "青枫江上",

  // 可配置的 Breadcrumb 路由名映射，用于控制 src\components\Breadcrumb.astro 中的静态路径显示文本
  // breadcrumbNames 已移至 src/i18n/index.ts 管理（更便于国际化）

  ogImage: "socialcard.png", // 位于 public/ 下的 Open Graph 图片路径
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 分钟
  showArchives: true,
  showBackButton: true, // 在文章详情页显示返回按钮

  // 编辑文章链接配置，enabled 为 true 则显示“编辑文章”按钮
  editPost: {
    enabled: true,
    text: "编辑文章",
    url: "https://github.com/0xnayuta/0xnayuta.github.io/edit/main/",
  },

  dynamicOgImage: true, // 是否启用动态 Open Graph 图片生成
  dir: "ltr", // "rtl" | "auto" 文本阅读和布局方向
  lang: "zh", // HTML 语言代码，若留空则默认为“en”
  timezone: "Asia/Shanghai", // 默认全局时区（IANA 格式） https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
