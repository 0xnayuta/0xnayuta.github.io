---
title: Typecho 博客框架部署教程
author: Wang Yan
pubDatetime: 2022-06-29T02:15:31Z
featured: false
draft: false
tags:
  - Typecho
  - 博客
  - 教程
  - 部署
description: 本文档详细介绍了如何在服务器上安装和配置 Typecho 博客框架，适合初学者参考。
---

## **⒈ 准备安装**

### 1.1 检查服务器是否支持 Typecho 完整运行

> - **PHP 5.4 ~ 7.4**
> - **MySQL，PostgreSQL 或 SQLite 任意一种数据库支持，并在 PHP 中安装了相关扩展**
> - **CURL 或 Socket 扩展支持**
> - **mbstring 或者 iconv 扩展支持**

安装 Typecho 的过程和大多数博客程序没有什么不同，整个安装过程只需要根据安装向导依次完成即可。

### 1.2 下载最新版

访问 [Typecho 官网](http://typecho.org/download) 下载最新的稳定版本。

官网版本只包含默认主题，该版本包括最新版 Joe 主题：[Typecho-Joe](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Typecho/typecho%201.20%20-%20Joe%207.3.7.zip)

> 注：本博客已全面改用 [handsome](https://www.ihewro.com/archives/489/) 主题，不再使用 Joe 主题。
>
> 2025 年 10 月 18 日起，本博客改用 [halo-theme-hao](https://github.com/chengzhongxue/halo-theme-hao) 主题。
>
> 2025 年 11 月 28 日起，本博客改用 [Astro](https://astro.build) 静态站点生成器，彻底告别 Typecho 博客框架。使用 [Astro-Paper](https://github.com/satnaing/astro-paper) 主题。

## **⒉ 解压缩安装包**

解压缩后你会看到如下的目录结构

> **/admin/**
>
> **/install/**
>
> **/usr/**
>
> **/var/**
>
> **/index.php**
>
> **/install.php**

## **⒊ 上传至服务器 WEB 目录**

将上面列出的所有文件和目录上传到服务器上的指定目录，如 `www/wwwroot/yourdomain.xxx` 或者任何你希望安装 Typecho 的目录。

## **⒋ 访问你的域名地址开始初始化安装**

上传完毕后使用浏览器直接访问安装目录即可看到 Typecho 的安装程序。恭喜，你的服务器可以完美支持 Typecho，点击进入下一步。
