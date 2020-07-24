import p5 from "p5"

export const BACKGROUND = 51

export const FPS = 30

export type Boundary = { left:number ; right:number }

export function p5boundary( k$:p5 ):Boundary { 
    return {left:0, right:k$.width} 
}

