---
title: Grasscutter 私服搭建指南
author: Wang Yan
pubDatetime: 2022-06-29T16:52:31Z
featured: false
draft: false
tags:
  - 原神
  - Grasscutter
  - 私服
  - 游戏
description: Grasscutter 是一款非官方的某动漫游戏私服服务端软件的重新实现，支持本地和云端部署。本文档包含了草剪刀的下载链接、功能介绍、快速设置指南、构建方法以及常见问题排查等内容。
---

## Releases

#### [2.8.0 基于 1.2.2-dev-7a2ed325 的 Grasscutter （服务端+客户端）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/2.8.0/2.8.0%20-%201.2.2-dev-7a2ed325.zip)

#### [2.8.0 基于 1.2.3-dev-e26cffed 的 Grasscutter （服务端+客户端）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/2.8.0/2.8.0%20-%201.2.3-dev-e26cffed.zip)

#### [2.8.0 基于 1.2.3-dev-e26cffed 的 Grasscutter （仅客户端+食用方法）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/GrasscutterClient.zip)

#### [3.0.0 基于 1.3.1-dev-08fdcf6e 的 Grasscutter （服务端加客户端，需要打补丁）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/3.0.0/3.0.0%20-%201.3.1-dev-08fdcf6e.zip)

> 注：打补丁方式为：将 `...\Grasscutter\launcher` 文件夹下的 `global-metadata.dat` 文件复制至 `...\Genshin Impact\Genshin Impact Game\YuanShen_Data\Managed\Metadata` 文件夹下，替换原文件，注意备份原文件。
>
> `1.3.1-dev-08fdcf6e` 包已知 bug：仅旅行者能获得怪物掉落经验；

#### [3.0.0 基于 1.3.1-dev-08f36195 的 Grasscutter （服务端加客户端，打补丁同上，解决了已知bug）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/3.0.0/3.0.0%20-%201.3.1-dev-08f36195.zip)

#### [3.1.0 基于 1.3.4-dev-98ac42a6 的 Grasscutter （服务端加客户端，需要打补丁）](https://cloud.wangyan.life/d/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/3.1.0/3.1.0%20-%201.3.4-dev-98ac42a6.zip)

#### [3.1.0 基于 1.4.2-dev-be8fbcbc 的 Grasscutter （服务端加客户端，需要打补丁）](https://cloud.wangyan.life/d/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/3.1.0/3.1.0%20-%201.4.2-dev-be8fbcbc.zip)

> 注：自 3.1.0 版本后，打补丁方式变更为：首先下载补丁文件 `UserAssembly.dll`，然后将补丁文件 `UserAssembly.dll` 复制至 `...\Genshin Impact\Genshin Impact Game\YuanShen_Data\Native` 文件夹下，替换原文件，注意备份原文件。

#### [3.1.0 版本补丁文件 UserAssembly.dll](https://cloud.wangyan.life/d/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/3.1.0/UserAssembly.dll)

#### [Grasscutter Tools v1.5.5 （适用于2.8.0）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/GrasscutterTools/GrasscutterTools-v1.5.5.exe)

#### [Grasscutter Tools v1.6.6 （适用于3.0.0）](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/GrasscutterTools/GrasscutterTools-v1.6.6.exe)

#### [Grasscutter Tools v1.6.8 （适用于3.1.0）](https://cloud.wangyan.life/d/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/GrasscutterTools/GrasscutterTools-v1.6.8.exe)

#### [仅客户端食用方法](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/%E9%A3%9F%E7%94%A8%E6%96%B9%E6%B3%95)

#### [WinRAR v6.11 x64 SC](https://cloud.wangyan.life/OneDrive/%E9%A1%B9%E7%9B%AE/Data/Grasscutter/WinRAR_v6.11_x64_SC_Repack.exe)

---

## [GitHub项目地址](https://github.com/Grasscutters/Grasscutter)

---

## [官网地址](https://grasscutter.io/)

**Grasscutter 是某个动漫游戏的服务器在软件层面的重新实现，简单来说就是模拟该游戏原来的服务器，以本地服务器或云服务器作为替代，在本地或云端实现该游戏的部分功能。**

> **A server software reimplementation for a certain anime game.**

---

## [Github官方文档](https://github.com/Grasscutters/Grasscutter/blob/development/README_zh-CN.md)

### 当前功能

- **登录**
- **战斗**
- **好友**
- **传送**
- **祈愿**
- **从控制台生成魔物**
- **多人游戏 _部分_ 可用**
- **物品（获得物品/角色、升级角色/武器等）**

---

### 快速设置指南

> 注意：如需帮助请加入 [Discord](https://discord.gg/T5vZU6UyeG)

#### 环境需求

- **[Java SE - 17](https://www.oracle.com/java/technologies/downloads/#java17)**
  > 注：如果仅运行服务端，只下载 jre 即可
- **[MongoDB](https://www.mongodb.com/try/download/community)（推荐 4.0+）**
- **代理程序：[mitmproxy](https://mitmproxy.org) (仅需 mitmdump，推荐使用)，[Fiddler Classic](https://telerik-fiddler.s3.amazonaws.com/fiddler/FiddlerSetup.exe) 等**

#### 服务端运行

> 注意：从旧版本升级到新版本，需要删除 `config.json` 使其重新生成

**⒈获取 `grasscutter.jar`**

> - **从 [Releases](https://github.com/Grasscutters/Grasscutter/releases/latest) 下载**
> - **[自行编译](https://github.com/Grasscutters/Grasscutter/blob/development/README_zh-CN.md#%E6%9E%84%E5%BB%BA)**

**⒉在 JAR 文件根目录中创建 `resources` 文件夹并复制 `BinOutput` 和 `ExcelBinOutput`_（查看 [Wiki](https://github.com/Grasscutters/Grasscutter/wiki) 了解更多）_**

**⒊确认 MongoDB 服务运行正常后，使用命令行 `java -jar grasscutter.jar` 运行 Grasscutter**

#### 客户端连接

**⒈在服务器控制台创建账户**

**⒉重定向流量（选择其中一种方法）**

- **mitmdump: `mitmdump -s proxy.py -k` 信任 CA 证书：**

> 注意：`mitmproxy` 的 CA 证书通常存放在 `%USERPROFILE%\ .mitmproxy`，或者从 `http://mitm.it` 下载证书

**双击 [安装根证书](https://docs.microsoft.com/en-us/skype-sdk/sdn/articles/installing-the-trusted-root-certificate#installing-a-trusted-root-certificate)** 或者 **使用命令行：**

`certutil -addstore root %USERPROFILE%\.mitmproxy\mitmproxy-ca-cert.cer`

- **Fiddler Classic**
  运行 Fiddler Classic，在设置中开启 `解密 https 通信` 并将端口设为除 `8888` 以外的任意端口 (工具 -> 选项 -> 连接) 并加载 [此脚本](https://github.lunatic.moe/fiddlerscript)
- **[Hosts 文件](https://github.com/Grasscutters/Grasscutter/wiki/Running#traffic-route-map)**

**⒊设置代理为 `127.0.0.1:8080` 或你设置的端口**

> **也可直接运行 `start.cmd` 一键启动服务端并设置代理，但必须设置 `JAVA_HOME` 环境变量并配置 `start_config.cmd`**

---

### 构建

> **具体参见 [构建](https://github.com/Grasscutters/Grasscutter/blob/development/README_zh-CN.md)**
> **命令列表参见 [Wiki](https://github.com/Grasscutters/Grasscutter/wiki)**

---

## 快速排查问题

- **如果编译失败，请检查 JDK 安装是否正确 (要求 JDK 17 并确认 JDK 处于环境变量 `PATH` 中)**
- **客户端无法登录/连接，4206，其他问题… —— 大部分情况是因为代理设置本身就是问题。 如果使用 Fiddler 请确认 Fiddler 监听端口不是 `8888`**
- **启动顺序：MongoDB > Grasscutter > 代理程序 (mitmdump, fiddler 等) > 客户端**

---
