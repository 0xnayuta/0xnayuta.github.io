### P1：建议合并前考虑的点

 #### 1. 移动端当前隐藏了 UI，但 JS 仍可能初始化和动画运行

 位置：src/components/Sakana.astro

 当前外层容器是：

 ```astro
   class="pointer-events-none fixed bottom-3 z-30 hidden h-[180px] w-[180px] sm:bottom-6 sm:block"
 ```

 也就是说 sm 以下通过 CSS hidden 隐藏。

 但客户端脚本里 mountSakana() 只判断了：

 ```ts
   window.matchMedia("(prefers-reduced-motion: reduce)").matches
 ```

 没有判断屏幕宽度。

 结果是：移动端 UI 不显示，但 Sakana 仍可能被创建、挂载、执行动画 RAF。虽然视觉上不可见，但会有不必要的运行成本。

 建议后续可以考虑：

 ```ts
   if (!window.matchMedia("(min-width: 640px)").matches) {
     destroySakana();
     return;
   }
 ```

 并可进一步监听 media query 变化，让窗口从移动端宽度切到桌面宽度时自动挂载，反之销毁。

 这不是功能阻塞，但从性能和一致性上建议优化。

 ────────────────────────────────────────────────────────────────────────────────

 #### 2. localStorage 读写建议包一层安全访问

 位置：src/vendors/sakana/index.ts

 当前 _readSnapshot() 和 _persistSnapshot() 直接使用：

 ```ts
   localStorage.getItem(...)
   localStorage.setItem(...)
 ```

 在绝大多数浏览器环境没问题。但在以下场景可能抛异常：

 - 隐私模式限制存储。
 - 浏览器安全策略禁用 localStorage。
 - storage quota 异常。
 - 某些嵌入式 WebView / 特殊环境。

 建议后续加一个小的安全封装，例如：

 ```ts
   private _safeReadStorage = () => {
     try {
       return localStorage.getItem(this._options.stateKey);
     } catch {
       return null;
     }
   };

   private _safeWriteStorage = (value: string) => {
     try {
       localStorage.setItem(this._options.stateKey, value);
     } catch {
       // ignore persistence failure
     }
   };
 ```

 这样状态持久化失败时不会影响 widget 本身运行。

 ────────────────────────────────────────────────────────────────────────────────

 #### 3. labels fallback 当前可能被 undefined 覆盖

 位置：src/vendors/sakana/index.ts 和 src/components/Sakana.astro

 当前构造器中是：

 ```ts
   labels: {
     ...defaultOptions.labels,
     ...options.labels,
   },
 ```

 但 getSakanaLabels() 返回的是：

 ```ts
   {
     nextCharacter: element.dataset.labelNextCharacter,
     autoMode: element.dataset.labelAutoMode,
     repository: element.dataset.labelRepository,
     hide: element.dataset.labelHide,
     show: element.dataset.labelShow,
   }
 ```

 这些值类型实际是 string | undefined。

 如果某个 data-* 缺失，undefined 会覆盖默认英文 fallback。当前项目内因为所有属性都写了，所以实际不会触发。但从组件健壮性看，建议后续改成“只合并有值的 label”。

 例如：

 ```ts
   const compactLabels = Object.fromEntries(
     Object.entries(options.labels ?? {}).filter(([, value]) => value)
   );
 ```

 或者在 getSakanaLabels() 层面只返回存在的字段。

 这个属于健壮性优化，不是当前 blocker。

 ────────────────────────────────────────────────────────────────────────────────

 ### P2：推荐优化

 #### 4. package.json 当前看起来只有排序变化，建议确认是否必要

 当前 git diff --stat 显示 package.json 有变更，但从内容看主要是 subset-font 在 devDependencies 中的位置变化。

 如果本次最终已经不再依赖 sakana-widget，且 pnpm-lock.yaml 没有语义变化，那么建议合并前确认：

 - 是否确实需要保留这次 package.json diff。
 - 是否有对应 lockfile 变化。
 - 是否只是 pnpm / formatter 引起的排序噪音。

 如果只是无意义排序变化，可以考虑后续还原，减少 PR 噪音。

 ────────────────────────────────────────────────────────────────────────────────

 #### 5. Sakana.astro 中的全局 ID 当前可接受，但建议保持唯一性约定

 位置：src/components/Sakana.astro

 当前使用：

 ```html
   #sakana-shell
   #sakana-widget
 ```

 由于该组件只在 Layout.astro 中全局挂载一次，这没有问题。

 建议在 README 或组件注释中保持这个约定：不要在其他页面重复渲染 <Sakana />。否则 document.querySelector("#sakana-widget") 只会命中第一个节点。

 这不是当前问题，只是全局组件维护约束。

 ────────────────────────────────────────────────────────────────────────────────

 #### 6. window.__sakana 类型扩展方式可接受，但后续可统一声明

 位置：src/components/Sakana.astro

 当前：

 ```ts
   type SakanaWindow = Window & {
     __sakana?: SakanaController;
   };
 ```

 这种局部声明简单有效。

 如果未来还有更多全局 runtime 状态，可以考虑集中放到 src/env.d.ts 或单独类型声明里扩展：

 ```ts
   declare global {
     interface Window {
       __sakana?: SakanaController;
     }
   }
 ```

 但当前只有一个组件使用，保持局部声明也没问题。

 ────────────────────────────────────────────────────────────────────────────────

 #### 7. 折叠态控制条的 aria-expanded 更完整的话可以加 aria-controls

 位置：src/vendors/sakana/index.ts

 当前已经有：

 ```ts
   this._domCtrlClose.setAttribute("aria-expanded", String(!this._hidden));
 ```

 这是正确方向。

 如果后续想进一步增强无障碍语义，可以给被控制区域一个稳定 ID，然后让按钮加：

 ```ts
   aria-controls="..."
 ```

 不过这需要整理动态 DOM 的 ID 生成策略，不是必须。

 ────────────────────────────────────────────────────────────────────────────────

 #### 8. registerCharacter() 可增加 runtime 校验

 位置：src/vendors/sakana/index.ts

 当前：

 ```ts
   static registerCharacter = (
     name: string,
     character: SakanaWidgetCharacter,
   ) => {
     const cloned = cloneCharacter(character);
     cloned.initialState.i = Math.min(0.5, Math.max(0, cloned.initialState.i));
     registeredCharacters.set(name, cloned);
   };
 ```

 TypeScript 层面没问题，但作为公开 API，如果运行时传入不完整对象，可能报错。

 如果这个 API 未来会暴露给外部或更多业务代码使用，建议复用 _isValidState 类似逻辑，或者在静态层加一个 validator。

 当前项目内部没有动态注册角色需求，因此不是紧急问题。

 ────────────────────────────────────────────────────────────────────────────────

 ### P3：可选细节

 #### 9. color-mix() 兼容性可以接受，但可加 fallback

 位置：src/vendors/sakana/index.css

 当前使用：

 ```css
   --sakana-color-bg: color-mix(...);
 ```

 现代浏览器基本没问题。如果你希望兼容更老浏览器，可以在 color-mix() 前加一条普通颜色 fallback。

 例如：

 ```css
   --sakana-color-bg: var(--background);
   --sakana-color-bg: color-mix(...);
 ```

 当前项目如果目标是现代浏览器，可以不处理。

 ────────────────────────────────────────────────────────────────────────────────

 #### 10. README 已经比较完整，后续可以补一小段“手动回归清单”

 位置：src/vendors/sakana/README.md

 现在 README 已经说明了架构、折叠态、状态持久化、i18n、许可。

 如果希望更工程化，可以加一段固定手动回归清单，例如：

 - 首次加载。
 - 刷新。
 - Astro 站内跳转。
 - 明暗主题切换。
 - 折叠 / 展开。
 - 切换角色后刷新。
 - 拖拽后刷新。
 - reduced motion。
 - 移动端隐藏。
 - localStorage 非法值回退。

 这对以后改 Sakana 时很有帮助。