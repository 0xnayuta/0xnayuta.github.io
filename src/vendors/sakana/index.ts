/*! sakana-lite | local Astro-oriented rewrite based on sakana-widget | MIT License */

import characters, {
  type SakanaWidgetCharacter,
  type SakanaWidgetState,
} from "./characters";
import svgCollapse from "./icons/collapse.svg?raw";
import svgExpand from "./icons/expand.svg?raw";
import svgGitHub from "./icons/github.svg?raw";
import svgPerson from "./icons/person.svg?raw";
import svgSync from "./icons/sync.svg?raw";

type SakanaWidgetVisibility = "show" | "hide";

type SakanaWidgetSnapshot = {
  version: 1;
  visibility: SakanaWidgetVisibility;
  character: string;
  state: SakanaWidgetState;
};

type SakanaWidgetLabels = {
  nextCharacter?: string;
  autoMode?: string;
  repository?: string;
  hide?: string;
  show?: string;
};

type RequiredLabels = Required<SakanaWidgetLabels>;

type SakanaWidgetOptions = {
  size?: number;
  character?: "chisato" | "takina" | string;
  controls?: boolean;
  rod?: boolean;
  draggable?: boolean;
  stroke?: {
    color?: string;
    width?: number;
  };
  threshold?: number;
  rotate?: number;
  title?: boolean;
  saveState?: boolean;
  stateKey?: string;
  labels?: SakanaWidgetLabels;
};

type RequiredOptions = {
  size: number;
  character: string;
  controls: boolean;
  rod: boolean;
  draggable: boolean;
  stroke: {
    color: string;
    width: number;
  };
  threshold: number;
  rotate: number;
  title: boolean;
  saveState: boolean;
  stateKey: string;
  labels: RequiredLabels;
};

const defaultOptions: RequiredOptions = {
  size: 200,
  character: "chisato",
  controls: true,
  rod: true,
  draggable: true,
  stroke: {
    color: "#b4b4b4",
    width: 10,
  },
  threshold: 0.1,
  rotate: 0,
  title: false,
  saveState: false,
  stateKey: "sakana-widget-status",
  labels: {
    nextCharacter: "Next character",
    autoMode: "Auto mode",
    repository: "Original Sakana Widget repository",
    hide: "Collapse Sakana widget",
    show: "Expand Sakana widget",
  },
};

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

const registeredCharacters = new Map<string, SakanaWidgetCharacter>(
  Object.entries(characters).map(([name, character]) => [
    name,
    clone(character),
  ]),
);

const cloneCharacter = (character: SakanaWidgetCharacter) => clone(character);

const getCanvasCtx = (canvas: HTMLCanvasElement, size: number) => {
  const ratio = (window.devicePixelRatio || 1) * 2;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Invalid canvas context");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);
  return ctx;
};

class SakanaWidget {
  private _options: RequiredOptions;
  private _host: HTMLElement | null = null;
  private _mounted = false;
  private _hidden = false;
  private _stateListeners: Array<(state: SakanaWidgetVisibility) => void> = [];

  private _imageSize = 0;
  private _canvasSize = 0;
  private _limit = { maxR: 60, maxY: 50, minY: -50 };
  private _lastRunUnix = Date.now();
  private _frameUnix = 1000 / 60;
  private _running = false;
  private _rafId = 0;
  private _magicForceTimeout = 0;
  private _magicForceEnabled = false;
  private _restoringSnapshot = false;

  private _char = "";
  private _image = "";
  private _state!: SakanaWidgetState;

  private _domWrapper: HTMLDivElement;
  private _domApp: HTMLDivElement;
  private _domCanvas: HTMLCanvasElement;
  private _domCanvasCtx!: CanvasRenderingContext2D;
  private _domMain: HTMLDivElement;
  private _domImage: HTMLDivElement;
  private _domCtrlPerson: HTMLButtonElement;
  private _domCtrlMagic: HTMLButtonElement;
  private _domCtrlClose: HTMLButtonElement;

  private _removeDragListeners: (() => void) | null = null;

  static getCharacter = (name: string): SakanaWidgetCharacter | null => {
    const character = registeredCharacters.get(name);
    return character ? cloneCharacter(character) : null;
  };

  static getCharacters = () =>
    Object.fromEntries(
      Array.from(registeredCharacters.entries()).map(([name, character]) => [
        name,
        cloneCharacter(character),
      ]),
    );

  static registerCharacter = (
    name: string,
    character: SakanaWidgetCharacter,
  ) => {
    const cloned = cloneCharacter(character);
    cloned.initialState.i = Math.min(0.5, Math.max(0, cloned.initialState.i));
    registeredCharacters.set(name, cloned);
  };

  constructor(options: SakanaWidgetOptions = {}) {
    const labels: RequiredLabels = { ...defaultOptions.labels };
    for (const key of Object.keys(labels) as Array<keyof RequiredLabels>) {
      const label = options.labels?.[key];
      if (label !== undefined) labels[key] = label;
    }

    this._options = {
      ...defaultOptions,
      ...options,
      stroke: {
        ...defaultOptions.stroke,
        ...options.stroke,
      },
      labels,
    };

    this.setCharacter(this._options.character);

    this._domWrapper = document.createElement("div");
    this._domWrapper.className = "sakana-widget-wrapper";

    this._domApp = document.createElement("div");
    this._domApp.className = "sakana-widget-app";
    this._domWrapper.appendChild(this._domApp);

    this._domCanvas = document.createElement("canvas");
    this._domCanvas.className = "sakana-widget-canvas";
    this._domApp.appendChild(this._domCanvas);

    this._domMain = document.createElement("div");
    this._domMain.className = "sakana-widget-main";
    this._domApp.appendChild(this._domMain);

    this._domImage = document.createElement("div");
    this._domImage.className = "sakana-widget-img";
    this._domImage.style.backgroundImage = `url('${this._image}')`;
    this._domMain.appendChild(this._domImage);

    const ctrl = document.createElement("div");
    ctrl.className = "sakana-widget-ctrl";

    this._domCtrlPerson = this._createCtrlButton(
      svgPerson,
      this._options.labels.nextCharacter,
    );
    this._domCtrlMagic = this._createCtrlButton(
      svgSync,
      this._options.labels.autoMode,
    );
    this._domCtrlClose = this._createCtrlButton(
      svgCollapse,
      this._options.labels.hide,
    );

    if (this._options.controls) {
      this._domMain.appendChild(ctrl);
      ctrl.appendChild(this._domCtrlPerson);
      ctrl.appendChild(this._domCtrlMagic);

      const github = document.createElement("a");
      github.className = "sakana-widget-ctrl-item";
      github.href = "https://github.com/dsrkafuu/sakana-widget";
      github.target = "_blank";
      github.rel = "noreferrer";
      github.ariaLabel = this._options.labels.repository;
      github.innerHTML = svgGitHub;
      if (this._options.title) github.title = this._options.labels.repository;
      ctrl.appendChild(github);

      ctrl.appendChild(this._domCtrlClose);
    }

    this._updateSize(this._options.size);
    this._updateLimit(this._options.size);
  }

  private _createCtrlButton = (svg: string, label: string) => {
    const button = document.createElement("button");
    button.className = "sakana-widget-ctrl-item";
    button.type = "button";
    button.ariaLabel = label;
    button.innerHTML = svg;
    if (this._options.title) button.title = label;
    return button;
  };

  private _updateLimit = (size: number) => {
    const maxR = Math.min(60, Math.max(30, size / 5));
    const maxY = size / 4;
    this._limit = { maxR, maxY, minY: -maxY };
  };

  private _updateSize = (size: number) => {
    this._options.size = size;
    this._imageSize = size / 1.25;
    this._canvasSize = size * 1.5;

    this._domApp.style.width = `${size}px`;
    this._domApp.style.height = `${size}px`;

    this._domCanvas.style.width = `${this._canvasSize}px`;
    this._domCanvas.style.height = `${this._canvasSize}px`;
    this._domCanvasCtx = getCanvasCtx(this._domCanvas, this._canvasSize);

    this._domMain.style.width = `${size}px`;
    this._domMain.style.height = `${size}px`;

    this._domImage.style.width = `${this._imageSize}px`;
    this._domImage.style.height = `${this._imageSize}px`;
    this._domImage.style.transformOrigin = `50% ${size}px`;

    this._draw();
  };

  private _calcCenterPoint = (
    degree: number,
    radius: number,
    x: number,
    y: number,
  ) => {
    const radian = (Math.PI / 180) * degree;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return {
      nx: sin * radius + cos * x - sin * y,
      ny: cos * radius - cos * y - sin * x,
    };
  };

  private _draw = () => {
    if (!this._state || !this._domCanvasCtx) return;

    const { r, y } = this._state;
    const { size, controls, rod, stroke } = this._options;
    const x = r;

    this._domImage.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;

    const ctx = this._domCanvasCtx;
    ctx.clearRect(0, 0, this._canvasSize, this._canvasSize);
    ctx.save();
    ctx.translate(this._canvasSize / 2, size + (this._canvasSize - size) / 2);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";

    if (rod) {
      ctx.beginPath();
      ctx.moveTo(0, controls ? -10 : 10);
      const radius = size - this._imageSize / 2;
      const { nx, ny } = this._calcCenterPoint(r, radius, x, y);
      ctx.lineTo(nx, -ny);
      ctx.stroke();
    }

    ctx.restore();
  };

  private _scheduleRun = () => {
    if (this._rafId || !this._mounted || this._hidden) return;
    this._running = true;
    this._rafId = requestAnimationFrame(this._run);
  };

  private _run = () => {
    this._rafId = 0;
    if (!this._running || !this._mounted || this._hidden) return;

    const originRotate = Math.min(120, Math.max(0, this._options.rotate));
    const now = Date.now();
    const diff = now - this._lastRunUnix;
    this._lastRunUnix = now;

    let inertia = this._state.i;
    if (diff < 16) inertia = (this._state.i / this._frameUnix) * diff;

    let { r, y, t, w } = this._state;
    const { d } = this._state;

    w = w - r * 2 - originRotate;
    r = r + w * inertia * 1.2;
    t = t - y * 2;
    y = y + t * inertia * 2;

    this._state = {
      ...this._state,
      r,
      y,
      w: w * d,
      t: t * d,
    };

    this._draw();

    if (
      Math.max(
        Math.abs(this._state.w),
        Math.abs(this._state.r),
        Math.abs(this._state.t),
        Math.abs(this._state.y),
      ) < this._options.threshold
    ) {
      this._running = false;
      return;
    }

    this._rafId = requestAnimationFrame(this._run);
  };

  private _move = (x: number, y: number) => {
    const { maxR, maxY, minY } = this._limit;
    const r = Math.min(maxR, Math.max(-maxR, x * this._state.s));
    const nextY = Math.min(maxY, Math.max(minY, y * this._state.s * 2));
    this._state = { ...this._state, r, y: nextY, w: 0, t: 0 };
    this._draw();
  };

  private _onPointerDown = (event: PointerEvent) => {
    if (!this._options.draggable) return;

    event.preventDefault();
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }

    const downPageY = event.pageY;

    const onPointerMove = (event: PointerEvent) => {
      const rect = this._domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      this._move(event.pageX - leftCenter, event.pageY - downPageY);
    };

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      this._removeDragListeners = null;
      this._lastRunUnix = Date.now();
      this._scheduleRun();
      this._persistSnapshot();
    };

    this._removeDragListeners = onPointerUp;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  };

  private _magicForce = () => {
    if (!this._mounted || this._hidden || !this._magicForceEnabled) return;

    if (Math.random() < 0.1) {
      this.nextCharacter();
    } else {
      this._state.t += (Math.random() - 0.5) * 150;
      this._state.w += (Math.random() - 0.5) * 200;
    }

    this._scheduleRun();
    this._magicForceTimeout = window.setTimeout(
      this._magicForce,
      Math.random() * 3000 + 2000,
    );
  };

  private _updateControlState = () => {
    const label = this._hidden
      ? this._options.labels.show
      : this._options.labels.hide;
    this._domCtrlClose.ariaLabel = label;
    this._domCtrlClose.innerHTML = this._hidden ? svgExpand : svgCollapse;
    this._domCtrlClose.setAttribute("aria-expanded", String(!this._hidden));
    if (this._options.title) this._domCtrlClose.title = label;

    this._domCtrlPerson.disabled = this._hidden;
    this._domCtrlMagic.disabled = this._hidden;
  };

  private _isValidState = (state: unknown): state is SakanaWidgetState => {
    if (!state || typeof state !== "object") return false;
    const candidate = state as Record<keyof SakanaWidgetState, unknown>;
    return (["i", "s", "d", "r", "y", "t", "w"] as const).every(
      (key) =>
        typeof candidate[key] === "number" && Number.isFinite(candidate[key]),
    );
  };

  private _readStorage = () => {
    try {
      return localStorage.getItem(this._options.stateKey);
    } catch {
      return null;
    }
  };

  private _writeStorage = (value: string) => {
    try {
      localStorage.setItem(this._options.stateKey, value);
    } catch {
      // Ignore storage failures so persistence never blocks widget rendering.
    }
  };

  private _readSnapshot = (): SakanaWidgetSnapshot | null => {
    if (!this._options.saveState) return null;

    const raw = this._readStorage();
    if (!raw) return null;

    try {
      const snapshot = JSON.parse(raw) as Partial<SakanaWidgetSnapshot>;
      if (
        snapshot.version !== 1 ||
        (snapshot.visibility !== "hide" && snapshot.visibility !== "show") ||
        typeof snapshot.character !== "string" ||
        !registeredCharacters.has(snapshot.character) ||
        !this._isValidState(snapshot.state)
      ) {
        return null;
      }

      return {
        version: 1,
        visibility: snapshot.visibility,
        character: snapshot.character,
        state: clone(snapshot.state),
      };
    } catch {
      return null;
    }
  };

  private _createSnapshot = (): SakanaWidgetSnapshot => ({
    version: 1,
    visibility: this._hidden ? "hide" : "show",
    character: this._char,
    state: clone(this._state),
  });

  private _persistSnapshot = () => {
    if (!this._options.saveState) return;
    this._writeStorage(JSON.stringify(this._createSnapshot()));
  };

  private _restoreSnapshot = () => {
    const snapshot = this._readSnapshot();
    if (!snapshot) return false;

    this._restoringSnapshot = true;
    try {
      this.setCharacter(snapshot.character);
      this.setState(snapshot.state);
      this._setHidden(snapshot.visibility === "hide", false);
    } finally {
      this._restoringSnapshot = false;
    }

    return true;
  };

  private _toggleVisibility = () => {
    if (this._hidden) {
      this.show();
      return;
    }

    if (this._options.saveState) {
      this.hide();
      return;
    }

    this.unmount();
  };

  private _setHidden = (hidden: boolean, persist = true) => {
    this._hidden = hidden;
    this._domWrapper.classList.toggle(
      "sakana-widget-wrapper--collapsed",
      hidden,
    );
    this._updateControlState();

    if (hidden) {
      this._running = false;
      this._magicForceEnabled = false;
      this._domCtrlMagic
        .querySelector("svg")
        ?.classList.remove("sakana-widget-icon--rotate");
      clearTimeout(this._magicForceTimeout);
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = 0;
      }
    } else {
      this._lastRunUnix = Date.now();
      this._scheduleRun();
    }

    if (persist) this._persistSnapshot();

    const state: SakanaWidgetVisibility = hidden ? "hide" : "show";
    for (const listener of this._stateListeners) listener(state);
  };

  triggerAutoMode = () => {
    if (this._hidden) return this;

    this._magicForceEnabled = !this._magicForceEnabled;

    const icon = this._domCtrlMagic.querySelector("svg");
    icon?.classList.toggle(
      "sakana-widget-icon--rotate",
      this._magicForceEnabled,
    );

    clearTimeout(this._magicForceTimeout);
    if (this._magicForceEnabled) {
      this._magicForceTimeout = window.setTimeout(this._magicForce, 500);
    }
    return this;
  };

  setState = (state: Partial<SakanaWidgetState>) => {
    this._state = { ...this._state, ...clone(state) };
    this._draw();
    if (this._mounted && !this._restoringSnapshot) this._persistSnapshot();
    return this;
  };

  setCharacter = (name: string) => {
    const targetChar = registeredCharacters.get(name);
    if (!targetChar) throw new Error(`Invalid character: ${name}`);

    this._char = name;
    this._image = targetChar.image;
    this._state = clone(targetChar.initialState);

    if (this._domImage) {
      this._domImage.style.backgroundImage = `url('${this._image}')`;
    }
    this._draw();
    this._scheduleRun();
    if (this._mounted && !this._restoringSnapshot) this._persistSnapshot();
    return this;
  };

  nextCharacter = () => {
    if (this._hidden) return this;

    const names = Array.from(registeredCharacters.keys()).sort();
    const currentIndex = names.indexOf(this._char);
    const nextName = names[(currentIndex + 1) % names.length];
    if (nextName) this.setCharacter(nextName);
    return this;
  };

  hide = () => {
    if (!this._hidden) this._setHidden(true);
    return this;
  };

  show = () => {
    if (this._hidden) this._setHidden(false);
    return this;
  };

  addStateListener = (listener: (state: SakanaWidgetVisibility) => void) => {
    this._stateListeners.push(listener);
    return this;
  };

  removeStateListener = (listener: (state: SakanaWidgetVisibility) => void) => {
    const idx = this._stateListeners.indexOf(listener);
    if (idx !== -1) this._stateListeners.splice(idx, 1);
    return this;
  };

  persistState = () => {
    this._persistSnapshot();
    return this;
  };

  mount = (el: HTMLElement | string) => {
    const host = typeof el === "string" ? document.querySelector(el) : el;
    if (!(host instanceof HTMLElement)) {
      throw new Error("Invalid mounting element");
    }

    this.unmount();
    this._host = host;
    this._mounted = true;
    host.replaceChildren(this._domWrapper);

    this._domImage.addEventListener("pointerdown", this._onPointerDown);
    if (this._options.controls) {
      this._domCtrlPerson.addEventListener("click", this.nextCharacter);
      this._domCtrlMagic.addEventListener("click", this.triggerAutoMode);
      this._domCtrlClose.addEventListener("click", this._toggleVisibility);
    }

    if (!this._restoreSnapshot()) {
      this._setHidden(false, false);
    }

    const state: SakanaWidgetVisibility = this._hidden ? "hide" : "show";
    for (const listener of this._stateListeners) listener(state);
    return this;
  };

  unmount = () => {
    this._mounted = false;
    this._running = false;
    this._magicForceEnabled = false;
    clearTimeout(this._magicForceTimeout);

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }

    this._removeDragListeners?.();
    this._removeDragListeners = null;

    this._domImage.removeEventListener("pointerdown", this._onPointerDown);
    if (this._options.controls) {
      this._domCtrlPerson.removeEventListener("click", this.nextCharacter);
      this._domCtrlMagic.removeEventListener("click", this.triggerAutoMode);
      this._domCtrlClose.removeEventListener("click", this._toggleVisibility);
    }

    if (this._domWrapper.parentNode) {
      this._domWrapper.parentNode.removeChild(this._domWrapper);
    }
    if (this._host) {
      this._host.replaceChildren();
      this._host = null;
    }
    return this;
  };
}

export default SakanaWidget;
export type {
  SakanaWidgetCharacter,
  SakanaWidgetLabels,
  SakanaWidgetOptions,
  SakanaWidgetSnapshot,
  SakanaWidgetState,
  SakanaWidgetVisibility,
};
