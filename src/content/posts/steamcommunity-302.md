---
title: Steamcommunity_302 - Steam 社区加速与修复工具
author: Wang Yan
pubDatetime: 2022-07-27T07:06:31Z
featured: false
draft: false
tags:
  - 软件推荐
  - Steamcommunity_302
description: Steamcommunity_302 是一个强大且实用的 Steam 社区加速与修复工具。它可以帮助用户加快 Steam 社区和商店的访问速度，修复部分网页布局和图片无法加载的问题，并提供多种实用功能，如 Discord 语音、Twitch 直播等访问优化。
---

## ⒈主要功能

- **Steam 社区**——Steam 社区访问 (默认强制开启)
- **Steam 商店/API/客服**——加快 Steam 商店访问
- **Steam 网页布局/图片修复**——修复 Steam 部分网页布局/图片无法加载
- **Discord 语音**——Discord 页面访问 (不包括语音传输部分)
- **Twitch 直播**——Twitch 页面访问 (不包括视频传输部分)
- **Origin 游戏下载 (Akamai)**——OriginCDN (Akamai) 重定向到 HTTP，解决部分地区 HTTPS 限速
- **Uplay 客户端更新防劫持**——Uplay 客户端更新防劫持 (HTTP 转 HTTPS)
- **Google (recaptcha)验证码**——谷歌验证码重定向到 recaptcha
- **Steam 好友聊天**——解决 Steaam 好友聊天网页加载失败
- **HB/Fanatical 图片修复**——修复移动网络下 HumbleBundle/Fanatical 图片无法加载
- **EADesktop CDN重定向 Akamai**——将 EADesktop CDN 重定向到 Akamai
- **CSGO Demo 下载，国区转国际**——CSGO Demo 下载 重定向到国际 CDN
- **Fandom 图片修复**——Fandom 图片修复
- **Blockbench 访问**——加快 Blockbench 3D 建模访问
- **Steam 商店/社区 锁区解锁**——解除锁区游戏的商店/社区无法访问/无法留言
- **Steam 好友聊天图片发送修复**——解决 Steam 好友聊天无法发送图片
- **Steam 登录反代**——解决部分地区运营商 Steam 登录困难
- **Uplay 下载 CDN 重定向**——Uplay 下载 CDN 快速重定向到国内
- **辐射 76 登录修复**——辐射 76 登录修复 (错误代码 1:5:1)
- **创意工坊大图修复**——修复创意工坊无法查看大图
- **OneDrive访问**——增加 OneDrive 访问稳定性
- **Jsdelivr**——增加 Jsdelivr 静态资源访问稳定性
- **XBOX 下载重定向国内**——当 XBOX PC APP 下载分配到海外时重定向回国内以加快下载速度
- **EPIC 下载重定向国内**——当 EPIC Games 下载分配到海外时重定向回国内以加快下载速度
- **我的世界 (API/官网修复)**——解决部分地区无法正常访问我的世界 API/官网
- **parsec.app**——访问修复

---

## ⒉更新日志

### For Windows 10 Or Windows 11

#### [V13.0.02](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V13.0.02_fix.zip)

> - Fix:[20250313(仅Windows)]更新 caddy 后端解决127.0.0.1:443被死循环访问时造成日志填满导致内存溢出
> - 增加仅监听,不写入 hosts(需要手动写入的hosts文件将保存在 S302.hosts)
> - 修复监听0.0.0.0时错误的IP被写入 hosts(更改为127.0.0.1)
> - 优化 hosts 写入逻辑,尝试解决低概率清空/写入失败问题 (每次写出备份 hosts.bak)
> - Windows 版本后端 caddy 更换为64位进程

[collapse status="false" title="历史版本"]

#### [V12.1.46](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.46.zip)

> - 增加 Steam 白山云 CDN 重定向阿里云 (修复个别地区商店布局/图片/视频无法加载) [需重新生成证书]
> - 更新 CM 域名 / 更新优选 CDN IP 列表

#### [V12.1.45](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.45.zip)

> - Steam 登录反代功能修复 (重新为 Steamdeck 启用) [需监听端口 2017-27026]
> - 更新 CM 列表
> - 尝试修复 parsec 启动慢 [需重新生成证书]
> - fandom 图片修复 [修复]
> - discord 无 IPV6 环境下黑屏修复

#### [V12.1.43](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.43.zip)

> - 增加 Parsec.app 客户端访问修复 [需重新生成证书]

#### [V12.1.42](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.42.zip)

> - 优化 discord 响应及附件上传
> - 优化启动速度
> - 移除 Steamdeck 的 Steam 登录反代(旧版本开启后可能导致卡 Steam 登录)
> - 修复开启 Steam 商店/社区解锁开启后展示框无法选择年度个人回顾
> - twitch 安全(申诉)/帮助页面修复
> - 更新 CM 域名 / 更新优选 CDN IP 列表

#### [V12.1.41](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.41.zip)

> - 修正旧版本在运行后错误的监听了 0.0.0.0:80
> - 修复 discord 客户端更新 [需重新生成证书]

#### [V12.1.40](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.40.zip)

> - 增加 huggingface / mega / vercel [需重新生成证书]
> - 修复 Artstation
> - Discord gateway 域名补全
> - 更新优选 CDN IP 列表

#### [V12.1.39](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.39.zip)

> - 尝试修复 Discord gateway 问题 (临时，仅Windows)
> - 修复超时bug (0425的12.1.39版本)

#### [V12.1.38](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.38.zip)

> - 修复上一版本我的世界修复选项打勾后无法正常保存&启动
> - 修复 twitch 转圈&掉宝&部分地区无法正常接入弹幕

#### [V12.1.37](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.37.zip)

> - 增加我的世界 API/官方访问[需重新生成证书&导入证书,详见常见问题解决]
> - Steam 商店静态资源 (Cloudflare) 重定向至 Akamai
> - 更新优选 CDN IP 列表
> - 更新 CM 域名 (Steam 登陆反代增加印度地区\*2)
> - Artstation CDN 域名补全

#### [V12.1.36](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.36.zip)

> - 修复 SteamDeck 最新固件更新后证书无法正常导入问题
> - 修复 Steam 反代不勾选锁区解锁时的跨域安全设置问题
> - 微软商店/XBOX 图片修复反代源由国内 CDN 更改为 Akamai

#### [V12.1.35](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.35.zip)

> - Steam 部分访问优化
> - 更新优选 CDN IP 列表
> - 更新 CM 域名
> - Github 访问优化
> - Discord 访问优化
> - 修复 12.1.34 版本访问异常

#### [V12.1.33](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.33.zip)

> - 修正 Discord 负载均衡机制以增加上游服务器连接成功率

#### [V12.1.32](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.32.zip)

> - 修复商店/社区解锁开启时展示框无法选择年度个人回顾
> - 修复部分游戏内 (CS/DOTA) 头像不显示问题
> - 修复 XBOX/EPIC下载重定向被错误生成写入 SteamDeck hosts 文件
> - 移除 MODIO 旧域名
> - 增加 GitHub 私有项目图片域名访问 (private-user-images)
> - Disocrd 图片上传指定 googleapis IP 负载均衡

#### [V12.1.31](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.31.zip)

> - 永久移除 (Pix\*) 支持
> - 更新 CM 域名
> - 增加 XBOX 下载重定向回国内 CDN
> - 增加 EPIC 下载重定向回国内 CDN

#### [V12.1.30](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.30.zip)

> - 修复 twitch 掉宝
> - 移除我的世界规则
> - 更新优选 CDN IP 列表
> - 更新 CM 域名

#### [V12.1.29](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.29.zip)

> - 增加我的世界部分请求修复 (解决移动宽带无法正常访问) [需重新生成证书]
> - 第三方登陆器应该无需任何特殊操作
> - UWP 版需要 EnableLoopback，参考常见问题解决 8
> - java 版登陆 realms 需要使用 keytool 导入根证书 steamcommunityCA.pem
> - 修复 fanbox 跨域问题

#### [V12.1.28](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.28.zip)

> - 增加 Googleapis(Ajax) 重定向至中国科技大学反代镜像 [需重新生成证书]
> - 增加 Steam 云同步 (Google) [需重新生成证书]，其他云同步 CDN 可通过 hosts 解决
> - 修复 [Steam聊天图片发送修复]
> - 修复 Disocrd 图片无法上传

#### [V12.1.27](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.27.zip)

> - 增加 Pixiv/ArtStation/Pinterest/Imgur [需重新生成证书]
> - 增加 discord.gg 反代
> - 修复 Steam 结算跨域
> - CDN 优选优化 (4IP 容错负载均衡)
> - 移除 twitch 无效域名

#### [V12.1.26](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.26.zip)

> - Steam 增加结算域名
> - 更新优选 CDN IP 列表
> - 修改负载均衡机制以增加 Discord 连接稳定性

#### [V12.1.25](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.25.zip)

> - 修正新版 Steam 客户端在移动宽带环境下无法正常加载好友头像

#### [V12.1.24](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.24.zip)

> - 恢复 Steam 登陆反代（G 胖又改回来了）
> - 更新 CM 域名
> - 谷歌验证码恢复为官方域名，从 hosts 中移除 recaptcha
> - 证书信息修改（Steam 客户端地址栏显示）

#### [V12.1.23](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.23.zip)

> - 修正社区解锁
> - 移除必应 Bing
> - CDN 优选 IP 列表更新

#### [V12.1.22](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.22.zip)

> - 修正必应随机错误

#### [V12.1.21](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.21.zip)

> - 增加必应 Bing
> - 修复闪退？（待验证）
> - 修正 steamdeck 服务文件残留未完全删除
> - recaptcha 验证码修复
> - steam 登陆反代暂时禁用，原因见上方红字
> - 后端进程版本更新，libcurl 版本更新

#### [V12.1.20](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.20.zip)

> - 图奇增加全球视频流 CDN 选择
> - 后端进程版本更新

#### [V12.1.19](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V12.1.19.zip)

> - 修正 Steam 客户端新闻页+新情报速递造成的网页框架崩溃(合并于创意工坊大图修复)

[/collapse]

---

### For Windows 7

#### [V11.2](https://cloud.wangyan.life/OneDrive/%E8%BD%AF%E4%BB%B6/Steamcommunity_302/steamcommunity_302_V11.2.zip)

> **注：由于升级后的后端进程 caddyv2 兼容性问题，从版本 V12.0 开始将不再兼容 Windows 7 ，Windows 7 用户请使用 V11.2 版本！**

---

## ⒊已知问题

1. Windows 7 无法正常使用 Discord 客户端 (11.x 版本/之前)；
2. 从版本 V12.0 开始将不再兼容 Windows 7；
3. 安装 Faceit 反作弊后将导致系统第三方证书全部被删除~~且证书无法自动导入 —— 无法导入已在 10.7 修复~~；
4. ADGuard 的过滤 localhost 连接设置导致证书不被信任 —— **[解决方法1](https://www.dogfight360.com/blog/686/#comment-27633)**、**[解决方法2](https://www.dogfight360.com/blog/686/#comment-23696)**；
5. 无法解除 Steam 家庭监护 —— 设置内关闭“Steam 商店锁区解锁”功能后重启 302；
6. ~笔记本在交流电与直流电切换时程序自动退出 —— 运行“任务计划程序”，找到 Steamcommunity_302 双击，检查“条件”选项内的相关设置 —— 已在12.1.11修复；~
7. 个别用户出现随时闪退，笔记本可参考上一条，其他设备目前调查中；
8. Steam 创意工坊大图修复功能开启时用户本地环境将无法正常访问 YouTube。

---

## ⒋常见问题解决

**详见原作者 Dogfihgt360 的个人博客：[羽翼城个人博客](https://www.dogfight360.com/blog/686/)**

> **该软件所有权归属于原作者 [Dogfihgt360](https://www.dogfight360.com/blog/) ！**

---

## AD：推荐机场 [v2free](https://w1.v2free.cc/auth/register?code=W8JK)，套餐多样、连接稳定！

## AD：免费使用 DeepSeek R1 和 V3：[SiliconCloud](https://cloud.siliconflow.cn/i/hSFaJpkd)，注册送14元余额，使用华为云昇腾云服务，全尺寸、满血版，连接快速且稳定！
