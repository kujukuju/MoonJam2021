class BoundaryRenderer {
    static _graphics = new PIXI.Graphics();

    static initialize() {
        Renderer.boundaryContainer.addChild(BoundaryRenderer._graphics);
    }

    static update(time, dt) {
        const boundaries = LevelManager.level.getBoundaries();
        const cameraAABB = Camera.getAABB();

        // god im fucking dumb
        BoundaryRenderer._graphics.clear();
        // but still doesnt work

        for (let i = 0; i < boundaries.length; i++) {
            const polyline = boundaries[i];
            for (let a = 0; a < polyline.length - 1; a++) {
                const currentPoint = polyline[a];
                const nextPoint = polyline[(a + 1) % polyline.length];

                const segment = [currentPoint, nextPoint];
                const aabb = [
                    [Math.min(segment[0][0], segment[1][0]), Math.min(segment[0][1], segment[1][1])],
                    [Math.max(segment[0][0], segment[1][0]), Math.max(segment[0][1], segment[1][1])],
                ];

                if (MathHelper.overlapAABB(cameraAABB, aabb)) {
                    // render the line finally
                    BoundaryRenderer._graphics.lineStyle({width: 20, color: 0x000000, cap: PIXI.LINE_CAP.ROUND});
                    BoundaryRenderer._graphics.moveTo(currentPoint[0], currentPoint[1]);
                    BoundaryRenderer._graphics.lineTo(nextPoint[0], nextPoint[1]);
                }
            }
        }
    }
}