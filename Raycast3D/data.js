"use strict"

export const RADIAN_MOD = Math.PI / 180;

export const MAP_INDEX_ = {
    START_PLACE: 100,
    FOES_BEGIN: 200,
    ITEMS_BEGIN: 300
}

const
    __ = 0,
    W1 = 1, W2 = 2, W3 = 3, W4 = 4, W5 = 5, W6 = 6, W7 = 7, W8 = 8, W9 = 9, W0 = 10,
    WA = 11, WB = 12, WC = 13, WD = 14, WE = 15, WF = 16, WG = 17, WH = 18, WI = 19, WJ = 20,
    WK = 21, WL = 22, WM = 23, WN = 24, WO = 25, WP = 26, WQ = 27, WR = 28, WS = 29, WT = 30,
    SS = MAP_INDEX_.START_PLACE;

export const RESOLUTION_ = {
    X: 320,//640,//*/1920,//*1280,/*/1120,//320,//240,
    Y: 240//480//*/1080//*960/*/840//240//180
}

export const WALL_SIZE = 256;//32;

export const LOOK_ = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3
};

export const IMG_ = {
    ARROW: { I: 0, NAME: "res/arrow.png" },
    TEX01: { I: 1, NAME: "res/wall01.png" },
    TEX02: { I: 2, NAME: "res/wall02.png" },
    TEX03: { I: 3, NAME: "res/wall03.png" },
    TEX04: { I: 4, NAME: "res/wall04.png" },
    TEX05: { I: 5, NAME: "res/floor02.png" },
    TEX06: { I: 6, NAME: "res/ceiling01.png" }
}

export const LEVEL_DATA = [
    // LEVEL 0
    {
        startLook: LOOK_.UP,
        sizeX: 32,
        sizeY: 32,
        walls: [IMG_.TEX01.I, IMG_.TEX02.I, IMG_.TEX03.I, IMG_.TEX04.I, IMG_.TEX05.I, IMG_.TEX06.I], // TEX05 and TEX06 is temporary yet
        map: [
            //0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31
            [__, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, __, W2, W2, W2, W2, W2, W2, W2, W2, W4, W4, W4, W4, W4, W4, W4, W4], // 0
            [__, W2, __, __, __, __, __, __, __, __, __, __, __, __, W2, __, W2, __, __, __, __, __, __, W2, W4, __, __, __, __, __, __, W4], // 1
            [__, W2, __, __, __, __, __, __, __, __, __, __, __, __, W2, __, W2, __, __, __, __, __, __, __, __, __, W3, __, __, __, __, W4], // 2
            [__, W2, __, __, __, __, __, __, __, __, __, __, __, __, W2, __, W2, __, __, __, __, __, __, W2, W4, __, __, __, __, W3, __, W4], // 3
            [__, W2, __, __, __, W2, W2, W2, W2, W2, W2, __, __, __, W2, __, W2, __, __, __, W2, W2, W2, W2, W4, __, __, __, W3, __, __, W4], // 4
            [__, W2, __, __, __, W2, __, __, __, __, W2, __, __, __, W2, __, W2, __, __, __, W2, __, __, __, W4, __, W3, __, __, __, W3, W4], // 5
            [__, W2, __, __, __, W2, __, __, __, __, W2, __, __, __, W2, __, W2, __, __, __, W2, __, __, __, W4, __, __, __, __, __, __, W4], // 6
            [__, W2, W2, __, W2, W2, __, __, __, __, W2, __, __, __, W2, __, W2, __, __, __, W2, __, __, __, W4, __, __, W3, __, __, __, W4], // 7
            [W3, W3, W3, __, W3, W3, W3, __, __, __, W2, __, __, __, W2, __, W2, __, __, __, W2, __, __, __, W4, __, __, __, __, W3, __, W4], // 8
            [W3, __, __, __, __, __, W3, __, __, __, W2, __, __, __, W2, __, W2, __, __, __, W2, __, __, __, W4, W3, __, __, __, __, __, W4], // 9
            [W3, __, __, __, __, __, W3, __, __, __, W2, __, __, __, W2, __, W2, __, __, __, W2, __, __, __, W4, __, __, __, W3, __, __, W4], // 10
            [W3, __, __, __, __, __, W3, __, __, __, W2, W2, __, W2, W2, __, W2, __, __, __, W2, __, __, __, W4, __, __, __, __, __, __, W4], // 11
            [W3, __, __, __, __, __, W3, __, W1, W1, W1, W1, __, W1, W1, W1, W1, W1, __, W1, W1, W1, W1, __, W4, __, W3, __, __, __, W3, W4], // 12
            [W3, __, __, __, __, __, W3, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, __, W4, __, __, __, __, __, __, W4], // 13
            [W3, __, __, __, __, __, W3, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, __, W4, W4, W4, W4, W4, W4, W4, W4], // 14
            [W3, __, __, __, __, __, W3, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, W2, W2, W2, W2, W2, W2, W2, W2, __], // 15
            [W3, W3, W3, W3, W3, W3, W3, __, W1, __, __, __, W2, __, W2, __, W2, __, W2, __, __, __, W1, W2, __, __, __, __, __, __, W2, __], // 16
            [__, __, __, __, __, __, __, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, W2, __, W3, __, __, W3, __, W2, __], // 17
            [__, W2, W2, W2, W2, W2, W2, W2, W1, __, __, __, W2, __, __, __, __, __, W2, __, __, __, W1, W2, __, __, __, __, __, __, W2, __], // 17
            [__, W2, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, W2, __], // 19
            [__, W2, __, W2, W2, W2, W2, W2, W1, __, __, __, W2, __, __, __, __, __, W2, __, __, __, W1, W2, __, __, __, __, __, __, W2, __], // 20
            [__, W2, __, W2, __, __, __, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, W2, __, W3, __, __, W3, __, W2, __], // 21
            [__, W2, __, W2, __, __, __, __, W1, __, __, __, W2, __, W2, __, W2, __, W2, __, __, __, W1, W2, __, __, __, __, __, __, W2, __], // 22
            [__, W2, __, W2, __, __, __, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, W2, W2, W2, W2, W2, W2, W2, W2, __], // 23
            [__, W2, __, W2, __, __, __, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, __, __, __, __, __, __, __, __, __], // 24
            [__, W2, __, W2, __, __, __, __, W1, __, __, __, __, __, __, __, __, __, __, __, __, __, W1, __, __, __, __, __, __, __, __, __], // 25
            [W1, W1, __, W1, W1, __, __, __, W1, W1, W1, W1, W1, W1, W1, __, W1, W1, W1, W1, W1, W1, W1, __, __, __, __, __, __, __, __, __], // 26
            [W1, __, __, __, W1, __, __, __, __, __, __, __, __, W2, W2, __, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W4, W4, W4, W4, W4], // 27
            [W1, __, __, __, W1, __, __, __, __, __, __, __, __, W2, __, __, __, __, __, __, __, __, __, __, __, __, W2, W4, __, __, __, W4], // 28
            [W1, __, SS, __, W1, __, __, __, __, __, __, __, __, W2, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, W4], // 29
            [W1, __, __, __, W1, __, __, __, __, __, __, __, __, W2, __, __, __, __, __, __, __, __, __, __, __, __, W2, W4, __, __, __, W4], // 30
            [W1, W1, W1, W1, W1, __, __, __, __, __, __, __, __, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W4, W4, W4, W4, W4]  // 31
        ]
    }
];