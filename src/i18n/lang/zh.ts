import type { UIStrings } from "../types";

export default {
  nav: {
    home: "主页",
    posts: "文章",
    tags: "标签",
    about: "关于",
    archives: "归档",
    search: "搜索",
  },
  post: {
    publishedAt: "发布于",
    updatedAt: "更新于",
    sharePostIntro: "分享这篇文章：",
    sharePostOn: "分享到 {{platform}}",
    sharePostViaEmail: "通过邮件分享",
    tagLabel: "标签",
    backToTop: "回到顶部",
    goBack: "返回",
    editPage: "编辑文章",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "页",
    pageLabel: (page) => `第 ${page} 页`,
    pagedLabel: (label, page) => `${label}（第 ${page} 页）`,
  },
  home: {
    socialLinks: "社交链接",
    featured: "精选文章",
    recentPosts: "最新文章",
    allPosts: "全部文章",
    heroTitle: "Ciallo～(∠・ω< )⌒★",
    rssFeed: "RSS 订阅",
    defaultQuote:
      "世界上只有一种真正的英雄主义，那就是在认清生活的真相之后，依然热爱生活。",
    defaultQuoteSource: "罗曼·罗兰",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "包含该标签的全部文章",

    tagsTitle: "标签",
    tagsDesc: "所有文章标签。",

    postsTitle: "文章",
    postsDesc: "我发布的所有文章。",

    archivesTitle: "归档",
    archivesDesc: "按时间归档的所有文章。",

    searchTitle: "搜索",
    searchDesc: "搜索任意文章内容 ...",
  },
  a11y: {
    skipToContent: "跳转到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    toggleTheme: "切换主题",
    searchPlaceholder: "搜索文章...",
    noResults: "未找到结果",
    goToPreviousPage: "前往上一页",
    goToNextPage: "前往下一页",
  },
  toc: {
    title: "目录",
    copyLink: "复制链接",
  },
  notFound: {
    title: "404 Not Found",
    message: "页面不存在",
    goHome: "返回首页",
    mascot: "Ciallo～(∠・ω< )⌒★",
  },
} satisfies UIStrings;
