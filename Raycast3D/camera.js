"use strict"

import { WALL_SIZE } from "./data.js";
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

    _width = WALL_SIZE / 4;//2;
    //_height = 0;
    _fov = 5.5;//11;
    _x = 0;
    _y = 0;
    _angle = 0;
    _raySourcePosition = { x: 0, y: 0 };

    constructor(x, y, angle) {
        this.setCameraPosition(x, y, angle);
        //this._calculateCameraHeight();
    }

    // _calculateCameraHeight() {
    //     this._height = (240 * this._width) / 320;
    // }

    setCameraView(width, fov) {
        this._width = width;
        this._fov = fov;
        //this._calculateCameraHeight();
    }

    setCameraPosition(x, y, angle) {
        this._x = x;
        this._y = y;
        this._angle = angle;
        //calculation of ray source position:
        let radians = (Math.PI / 180) * ((this._angle + 90) % 360);
        this._raySourcePosition.x = this._x + Math.cos(radians) * this._fov;
        this._raySourcePosition.y = this._y + Math.sin(radians) * this._fov;
    }

    drawSceneToScreen(scene, screen) {
        let ray, fade;
        for (let i = 0; i < 320; i++) {
            ray = this._getRay(scene, i);
            if (ray.surface != undefined) {
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

    _getRay(scene, rayIndex) {
        let ray = {
            surface: undefined,
            surfaceHeight: 0,
            positionOnSurface: 0,
            distanceToSurface: 0
        };
        let cameraPoint = (rayIndex * this._width) / 320 - (this._width >>> 1);
        let cameraPointPos = { x: 0, y: 0 };
        let rayDstPos = { x: 0, y: 0 };
        let oldRayDstPos = { x: 0, y: 0 };
        let radians = (Math.PI / 180) * ((this._angle) % 360);
        cameraPointPos.x = this._x + Math.cos(radians) * cameraPoint;
        cameraPointPos.y = this._y + Math.sin(radians) * cameraPoint;
        [rayDstPos.x, rayDstPos.y] = [cameraPointPos.x, cameraPointPos.y];
        let xInc = cameraPointPos.x >= this._raySourcePosition.x ? WALL_SIZE : -WALL_SIZE;
        let yInc = cameraPointPos.y >= this._raySourcePosition.y ? WALL_SIZE : -WALL_SIZE;
        let rightLimit = scene.mapData.sizeX * WALL_SIZE;
        let bottomLimit = scene.mapData.sizeY * WALL_SIZE;
        let controlSizeX = cameraPointPos.x - this._raySourcePosition.x;
        let controlSizeY = cameraPointPos.y - this._raySourcePosition.y;
        let traceEndingPosition = undefined;
        // ray tracing:
        if (Math.abs(controlSizeX) < Math.abs(controlSizeY)) {
            // go through Y coordinate first:
            if (yInc > 0 && rayDstPos.y % WALL_SIZE > 0) {
                rayDstPos.y += WALL_SIZE;
            }
            rayDstPos.y = Math.floor(rayDstPos.y / WALL_SIZE) * WALL_SIZE;
            rayDstPos.x = this._getEndPosA(controlSizeX, controlSizeY, this._raySourcePosition.x, this._raySourcePosition.y, rayDstPos.y);
            [oldRayDstPos.x, oldRayDstPos.y] = [rayDstPos.x - controlSizeX * 2, rayDstPos.y - controlSizeY * 2];
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
            [oldRayDstPos.x, oldRayDstPos.y] = [rayDstPos.x - controlSizeX * 2, rayDstPos.y - controlSizeY * 2];
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
            let textureIndex = scene.mapData.map[traceEndingPosition.tileY][traceEndingPosition.tileX];
            ray.surface = scene.textureData[textureIndex];
            let a = cameraPointPos.x - traceEndingPosition.sceneX;
            let b = cameraPointPos.y - traceEndingPosition.sceneY;
            let dd = Math.sqrt((a * a) + (b * b));
            a = this._raySourcePosition.x - cameraPointPos.x;
            b = this._raySourcePosition.y - cameraPointPos.y;
            let cc = Math.sqrt((a * a) + (b * b));
            let finalDistance = this._fov * dd / cc;
            ray.distanceToSurface = dd;
            ray.surfaceHeight = (WALL_SIZE * this._fov * (320 / this._width)) / finalDistance;

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
        return (scene.mapData.map[y][x] != 0 && scene.mapData.map[y][x] != 10000);
    }

}