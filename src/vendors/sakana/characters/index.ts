import chisatoImage from "./chisato.png?url";
import takinaImage from "./takina.png?url";

export interface SakanaWidgetState {
  /**
   * inertia
   */
  i: number;
  /**
   * stickiness
   */
  s: number;
  /**
   * decay
   */
  d: number;
  /**
   * angle
   */
  r: number;
  /**
   * height
   */
  y: number;
  /**
   * vertical speed
   */
  t: number;
  /**
   * horizontal speed
   */
  w: number;
}

export interface SakanaWidgetCharacter {
  image: string;
  initialState: SakanaWidgetState;
}

const chisato: SakanaWidgetCharacter = {
  image: chisatoImage,
  initialState: {
    i: 0.045,
    s: 0.1,
    d: 0.995,
    r: 18,
    y: 0,
    t: 0,
    w: 0,
  },
};

const takina: SakanaWidgetCharacter = {
  image: takinaImage,
  initialState: {
    i: 0.045,
    s: 0.1,
    d: 0.995,
    r: 16,
    y: 0,
    t: 0,
    w: 0,
  },
};

export default {
  chisato,
  takina,
};
