"use strict"

import { WALL_SIZE } from "./data.js";
import { RADIAN_MOD } from "./data.js";
import { resolution } from "./screen.js";
import { disableImageSmoothing } from "./screen.js";

const
    CLOSE_LIGHT_DISTANCE = WALL_SIZE * 1,
    FAR_LIGHT_DISTANCE = WALL_SIZE * 12,
    DIRECTION_X = 0,
    DIRECTION_Y = 1;

const
    SIDE_LEFT = 0,
    SIDE_UP = 1,
    SIDE_RIGHT = 2,
    SIDE_DOWN = 3;

export class Camera {

    _width = WALL_SIZE / /*4;/*/2 - 4 * (WALL_SIZE >>> 5);
    _height = 0;
    _fov = 8 * (WALL_SIZE >>> 5);//*5.5;/*/11;
    _x = 0;
    _y = 0;
    _angle = 0;
    _raySourcePosition = { x: 0, y: 0 };
    _floorAndCeilingCanvas = undefined;
    _floorAndCeilingContext = undefined;
    // _floorAndCeilingData = undefined;

    constructor(x, y, angle) {
        this.setCameraPosition(x, y, angle);
        this._calculateCameraHeight();
        this._preliminaryCalculations();
        this._resetFloorAndCeilingData();
    }

    _calculateCameraHeight() {
        this._height = (resolution.y * this._width) / resolution.x;
    }

    setCameraView(width, fov) {
        this._width = width;
        this._fov = fov;
        this._calculateCameraHeight();
        this._preliminaryCalculations();
    }

    _resetFloorAndCeilingData() {
        this._floorAndCeilingCanvas = document.createElement("canvas");
        this._floorAndCeilingCanvas.width = 2;
        this._floorAndCeilingCanvas.height = Math.floor(resolution.y / 2);
        this._floorAndCeilingContext = this._floorAndCeilingCanvas.getContext("2d");
        this._floorAndCeilingContext.alpha = false;
        disableImageSmoothing(this._floorAndCeilingContext);
        // this._floorAndCeilingData = this._floorAndCeilingContext.createImageData(2, Math.floor(resolution.y / 2));
        this._floorAndCeilingContext.fillStyle = "rgb(0,50,0)";
        this._floorAndCeilingContext.fillRect(0, 0, this._floorAndCeilingCanvas.width, this._floorAndCeilingCanvas.height);
    }

    setCameraPosition(x, y, angle) {
        this._x = x;
        this._y = y;
        this._angle = angle % 360;
        //calculation of ray source position:
        let radians = RADIAN_MOD * ((this._angle + 90) % 360);
        this._raySourcePosition.x = this._x + Math.cos(radians) * this._fov;
        this._raySourcePosition.y = this._y + Math.sin(radians) * this._fov;
    }

    drawSceneToScreen(scene, screen) {
        let ray, fade, cameraPointPos;
        for (let i = 0; i < resolution.x; i++) {
            cameraPointPos = this._getCameraPointPos(i);
            //ray = this._getRay(scene, i);
            ray = this._getRay(scene, cameraPointPos);
            if (ray.surface != undefined) {
                if (ray.surfaceHeight < resolution.y) {
                    // let height = (resolution.y >>> 1) - Math.floor(ray.surfaceHeight / 2);
                    let height = this._drawFloorAndCeilingLine(scene, ray.distanceToSurface, ray.surfaceHeight, ray.controlSizeX, ray.controlSizeY);
                    screen.drawCeilingAndFloorLineInPosition(this._floorAndCeilingCanvas, height, i);
                }
                fade = 0;
                if (ray.distanceToSurface > CLOSE_LIGHT_DISTANCE) {
                    fade = (ray.distanceToSurface - CLOSE_LIGHT_DISTANCE) * 100 / FAR_LIGHT_DISTANCE;
                    if (fade > 100) {
                        fade = 100;
                    }
                }
                screen.drawLineFromTextureInPosition(ray.surface, ray.surfaceHeight, ray.positionOnSurface, i, fade);
            }
        }
    }

    _preliminaryCalculatedXinc = undefined;
    _preliminaryCalculatedYinc = undefined;
    _prelimCalcSurfaceHeight_Pt1 = undefined;
    _prelimCalcSurfaceHeight_Pt2 = undefined;

    _preliminaryCalculations() {
        this._preliminaryCalculatedXinc = [];
        this._preliminaryCalculatedYinc = [];
        this._preliminaryCalculatedXinc.length = resolution.x;
        this._preliminaryCalculatedYinc.length = resolution.x;
        for (let j = 0; j < resolution.x; j++) {
            let cameraPoint = (j * this._width) / resolution.x - (this._width >>> 1);
            this._preliminaryCalculatedXinc[j] = [];
            this._preliminaryCalculatedYinc[j] = [];
            this._preliminaryCalculatedXinc[j].length = 360;
            this._preliminaryCalculatedYinc[j].length = 360;
            for (let i = 0; i < 360; i++) {
                let radians = RADIAN_MOD * i;
                this._preliminaryCalculatedXinc[j][i] = Math.cos(radians) * cameraPoint;
                this._preliminaryCalculatedYinc[j][i] = Math.sin(radians) * cameraPoint;
            }
        }
        this._prelimCalcSurfaceHeight_Pt1 = (WALL_SIZE * this._height * resolution.x) / this._width;
        this._prelimCalcSurfaceHeight_Pt2 = this._height / this._fov;
    }

    _getCameraPointPos(rayIndex) {
        let cameraPointPos = { x: 0, y: 0 };
        cameraPointPos.x = this._x + this._preliminaryCalculatedXinc[rayIndex][this._angle];
        cameraPointPos.y = this._y + this._preliminaryCalculatedYinc[rayIndex][this._angle];
        return cameraPointPos;
    }

    _getRay(scene, cameraPointPos/*rayIndex*/) {
        let ray = {
            surface: undefined,
            surfaceHeight: 0,
            positionOnSurface: 0,
            distanceToSurface: 0,
            controlSizeX: 0,
            controlSizeY: 0
        };
        // let cameraPoint = (rayIndex * this._width) / resolution.x - (this._width >>> 1);
        //////let cameraPointPos = { x: 0, y: 0 };
        let rayDstPos = { x: 0, y: 0 };
        let oldRayDstPos = { x: 0, y: 0 };
        /*let radians = RADIAN_MOD * this._angle;
        cameraPointPos.x = this._x + Math.cos(radians) * cameraPoint;
        cameraPointPos.y = this._y + Math.sin(radians) * cameraPoint;*/
        //////cameraPointPos.x = this._x + this._preliminaryCalculatedXinc[rayIndex][this._angle];
        //////cameraPointPos.y = this._y + this._preliminaryCalculatedYinc[rayIndex][this._angle];
        [rayDstPos.x, rayDstPos.y] = [cameraPointPos.x, cameraPointPos.y];
        let xInc = cameraPointPos.x >= this._raySourcePosition.x ? WALL_SIZE : -WALL_SIZE;
        let yInc = cameraPointPos.y >= this._raySourcePosition.y ? WALL_SIZE : -WALL_SIZE;
        let rightLimit, bottomLimit;
        [rightLimit, bottomLimit] = scene.getMapSize();
        rightLimit *= WALL_SIZE;
        bottomLimit *= WALL_SIZE;
        let controlSizeX = cameraPointPos.x - this._raySourcePosition.x;
        let controlSizeY = cameraPointPos.y - this._raySourcePosition.y;
        ray.controlSizeX = controlSizeX;
        ray.controlSizeY = controlSizeY;
        let traceEndingPosition = undefined;
        // ray tracing:
        if (Math.abs(controlSizeX) < Math.abs(controlSizeY)) {
            // go through Y coordinate first:
            if (yInc > 0 && rayDstPos.y % WALL_SIZE > 0) {
                rayDstPos.y += WALL_SIZE;
            }
            rayDstPos.y = Math.floor(rayDstPos.y / WALL_SIZE) * WALL_SIZE;
            rayDstPos.x = this._getEndPosA(controlSizeX, controlSizeY, this._raySourcePosition.x, this._raySourcePosition.y, rayDstPos.y);
            [oldRayDstPos.x, oldRayDstPos.y] = [cameraPointPos.x, cameraPointPos.y];
            while (rayDstPos.x > 0 && rayDstPos.x < rightLimit && rayDstPos.y > 0 && rayDstPos.y < bottomLimit && traceEndingPosition == undefined) {
                traceEndingPosition = this._getTraceEndingPosition(scene, oldRayDstPos.x, oldRayDstPos.y, rayDstPos.x, rayDstPos.y, DIRECTION_Y, controlSizeX, controlSizeY);
                if (traceEndingPosition == undefined) {
                    [oldRayDstPos.x, oldRayDstPos.y] = [rayDstPos.x, rayDstPos.y];
                    rayDstPos.y += yInc;
                    rayDstPos.x = this._getEndPosA(controlSizeX, controlSizeY, this._raySourcePosition.x, this._raySourcePosition.y, rayDstPos.y);
                }
            }
        }
        else {
            // go through X coordinate first:
            if (xInc > 0 && rayDstPos.x % WALL_SIZE > 0) {
                rayDstPos.x += WALL_SIZE;
            }
            rayDstPos.x = Math.floor(rayDstPos.x / WALL_SIZE) * WALL_SIZE;
            rayDstPos.y = this._getEndPosA(controlSizeY, controlSizeX, this._raySourcePosition.y, this._raySourcePosition.x, rayDstPos.x);
            [oldRayDstPos.x, oldRayDstPos.y] = [cameraPointPos.x, cameraPointPos.y];
            while (rayDstPos.x > 0 && rayDstPos.x < rightLimit && rayDstPos.y > 0 && rayDstPos.y < bottomLimit && traceEndingPosition == undefined) {
                traceEndingPosition = this._getTraceEndingPosition(scene, oldRayDstPos.x, oldRayDstPos.y, rayDstPos.x, rayDstPos.y, DIRECTION_X, controlSizeX, controlSizeY);
                if (traceEndingPosition == undefined) {
                    [oldRayDstPos.x, oldRayDstPos.y] = [rayDstPos.x, rayDstPos.y];
                    rayDstPos.x += xInc;
                    rayDstPos.y = this._getEndPosA(controlSizeY, controlSizeX, this._raySourcePosition.y, this._raySourcePosition.x, rayDstPos.x);
                }
            }
        }
        if (traceEndingPosition != undefined) {
            ray.surface = scene.getSurface(traceEndingPosition.tileX, traceEndingPosition.tileY);
            let a = cameraPointPos.x - traceEndingPosition.sceneX;
            let b = cameraPointPos.y - traceEndingPosition.sceneY;
            let dd = Math.sqrt((a * a) + (b * b));
            a = this._raySourcePosition.x - cameraPointPos.x;
            b = this._raySourcePosition.y - cameraPointPos.y;
            let cc = Math.sqrt((a * a) + (b * b));
            let finalDistance = this._fov * dd / cc;
            ray.distanceToSurface = dd;
            //ray.surfaceHeight = (WALL_SIZE * this._fov * (320 / this._width)) / finalDistance;
            //ray.surfaceHeight = (WALL_SIZE * this._height * (resolution.x / this._width)) / (((this._height * finalDistance) / this._fov) + this._fov /*8*/);
            ray.surfaceHeight = this._prelimCalcSurfaceHeight_Pt1 / ((this._prelimCalcSurfaceHeight_Pt2 * finalDistance) + this._fov);
            ray.positionOnSurface = Math.floor(Math.max(traceEndingPosition.sceneX % WALL_SIZE, traceEndingPosition.sceneY % WALL_SIZE));
            if (traceEndingPosition.side == SIDE_UP || traceEndingPosition.side == SIDE_RIGHT) {
                ray.positionOnSurface = WALL_SIZE - ray.positionOnSurface - 1;
            }
            ray.positionOnSurface = Math.floor((ray.positionOnSurface * ray.surface.width) / WALL_SIZE);
        }
        return ray;
    }

    _getEndPosA(controlSizeA, controlSizeB, startPosA, startPosB, endPosB) {
        return ((controlSizeA * (endPosB - startPosB)) / controlSizeB) + startPosA;
        //(rayDstPos.x - this._raySourcePosition.x) / (rayDstPos.y - this._raySourcePosition.y) == controlSizeX / controlSizeY
    }

    _getTraceEndingPosition(scene, startPosX, startPosY, endPosX, endPosY, direction, controlSizeX, controlSizeY) {
        let pos = { sceneX: 0, sceneY: 0, tileX: 0, tileY: 0, side: SIDE_UP };
        let surfaceEarned = false;
        let oldTileX, oldTileY, newTileX, newTileY;
        let xDifference = endPosX - startPosX;
        let yDifference = endPosY - startPosY;
        [oldTileX, oldTileY] = this._getTilePos(startPosX, startPosY, xDifference, yDifference);
        [newTileX, newTileY] = this._getTilePos(endPosX, endPosY, xDifference, yDifference);
        switch (direction) {
            case DIRECTION_X:
                if (oldTileY != newTileY) {
                    if (this._isSurface(scene, oldTileX, newTileY)) {
                        pos.tileX = oldTileX;
                        pos.tileY = newTileY;
                        pos.sceneY = newTileY * WALL_SIZE;
                        if (yDifference >= 0) {
                            pos.side = SIDE_UP;
                        }
                        else {
                            pos.sceneY += WALL_SIZE;
                            pos.side = SIDE_DOWN;
                        }
                        pos.sceneX = this._getEndPosA(controlSizeX, controlSizeY, this._raySourcePosition.x, this._raySourcePosition.y, pos.sceneY);
                        surfaceEarned = true;
                    }
                }
                break;
            case DIRECTION_Y:
                if (oldTileX != newTileX) {
                    if (this._isSurface(scene, newTileX, oldTileY)) {
                        pos.tileX = newTileX;
                        pos.tileY = oldTileY;
                        pos.sceneX = newTileX * WALL_SIZE;
                        if (xDifference >= 0) {
                            pos.side = SIDE_LEFT;
                        }
                        else {
                            pos.sceneX += WALL_SIZE;
                            pos.side = SIDE_RIGHT;
                        }
                        pos.sceneY = this._getEndPosA(controlSizeY, controlSizeX, this._raySourcePosition.y, this._raySourcePosition.x, pos.sceneX);
                        surfaceEarned = true;
                    }
                }
                break;
            default:
                return undefined;
        }
        if (!surfaceEarned && this._isSurface(scene, newTileX, newTileY)) {
            pos.tileX = newTileX;
            pos.tileY = newTileY;
            pos.sceneX = endPosX;
            pos.sceneY = endPosY;
            if (direction == DIRECTION_X) {
                pos.side = xDifference >= 0 ? SIDE_LEFT : SIDE_RIGHT;
            }
            else {
                pos.side = yDifference >= 0 ? SIDE_UP : SIDE_DOWN;
            }
            surfaceEarned = true;
        }
        return (surfaceEarned ? pos : undefined);
    }

    _getTilePos(x, y, xDifference, yDifference) {
        let resultX = Math.floor(x / WALL_SIZE);
        let resultY = Math.floor(y / WALL_SIZE);
        if (xDifference < 0 && x % WALL_SIZE == 0) {
            resultX--;
        }
        if (yDifference < 0 && y % WALL_SIZE == 0) {
            resultY--;
        }
        return [resultX, resultY];
    }

    _isSurface(scene, x, y) {
        return scene.isWall(x, y);
    }

    _drawFloorAndCeilingLine(scene, distanceToCamera, hPixels, controlSizeX, controlSizeY) {
        // let result = {
        //     height: 0,
        //     floor: false,
        //     ceiling: false
        // }
        let controlHypotenuse = Math.sqrt((controlSizeX * controlSizeX) + (controlSizeY * controlSizeY));
        let xCalcMultiplier = controlSizeX / controlHypotenuse;
        let yCalcMultiplier = controlSizeY / controlHypotenuse;
        //result.height = (resolution.y >>> 1) - Math.floor(hPixels / 2);
        let height = (resolution.y >>> 1) - Math.floor(hPixels / 2);
        let multiplierToRealSize = this._height / resolution.y;
        let hReal = Math.round(hPixels * multiplierToRealSize);
        let m = ((distanceToCamera * WALL_SIZE) / (WALL_SIZE - hReal)) - distanceToCamera;
        let mXwallsize = WALL_SIZE * m;
        let ceiling, floor, textureX, textureY;
        for (let i = /*result.*/height - 1, j = 0; i >= 0; i-- , j++) {
            //let h = i * multiplierToRealSize;
            let h = (hPixels + j) * multiplierToRealSize;
            let floorHypotenuse = (mXwallsize / h) - m + this._fov;
            let x = this._x + (xCalcMultiplier * floorHypotenuse);
            let y = this._y + (yCalcMultiplier * floorHypotenuse);
            let tileX = Math.floor(x / WALL_SIZE);
            let tileY = Math.floor(y / WALL_SIZE);
            let surfaceX = x % WALL_SIZE;
            let surfaceY = y % WALL_SIZE;
            [ceiling, floor] = scene.getFloorAndCeiling(tileX, tileY);
            if (ceiling != undefined) {
                textureX = Math.floor((surfaceX * ceiling.width) / WALL_SIZE);
                textureY = Math.floor((surfaceY * ceiling.height) / WALL_SIZE);
                this._floorAndCeilingContext.drawImage(ceiling, textureX, textureY, 1, 1, 0, i, 1, 1);
            }
            if (floor != undefined) {
                textureX = Math.floor((surfaceX * floor.width) / WALL_SIZE);
                textureY = Math.floor((surfaceY * floor.height) / WALL_SIZE);
                // this._floorAndCeilingContext.drawImage(floor, textureX, textureY, 1, 1, 1, j, 1, 1);
            }
            // if (this._isSurface(scene, tileX, tileY)) {
            //     // paste transparent black pixel
            // }
            // else {
            //     // paste pixel from texture
            // }
        }
        return height;//result;
    }

    // _getFloorHypotenuse(h, m, mXwallsize) {
    //     return (mXwallsize / h) - m;
    // }

}