class MathHelper {
    static createAABBFromPolygon(polygon, padding) {
        padding = padding ?? 0;

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = polygon[0][0];
        aabb.lowerBound.y = polygon[0][1];
        aabb.upperBound.x = polygon[0][0];
        aabb.upperBound.y = polygon[0][1];

        for (let i = 1; i < polygon.length; i++) {
            aabb.lowerBound.x = Math.min(aabb.lowerBound.x, polygon[i][0]);
            aabb.lowerBound.y = Math.min(aabb.lowerBound.y, polygon[i][1]);
            aabb.upperBound.x = Math.max(aabb.upperBound.x, polygon[i][0]);
            aabb.upperBound.y = Math.max(aabb.upperBound.y, polygon[i][1]);
        }

        aabb.lowerBound.x -= padding;
        aabb.lowerBound.y -= padding;
        aabb.upperBound.x += padding;
        aabb.upperBound.y += padding;

        return aabb;
    }

    // I think.... this pushes p2 out of p1? yeah probably
    static resolvePolygonPolygonCollision(p1, p2) {
        let greatestDistanceSquared = 0;
        let greatestDistanceVector = null;

        for (let i = 0; i < p2.length; i++) {
            const point = p2[i];

            // at this point the point has to be in the polygon to push out
            if (!MathHelper.isPointInPolygon(point, p1)) {
                continue;
            }

            let smallestDistanceSquared = Number.MAX_SAFE_INTEGER;
            let smallestDistanceVector = null;
            for (let a = 0; a < p1.length; a++) {
                const currentPoint = p1[a];
                const nextPoint = p1[(a + 1) % p1.length];

                const lineSegment = [currentPoint, nextPoint];
                const nearestPoint = MathHelper.nearestPointOnLine(point, lineSegment);
                const dx = nearestPoint[0] - point[0];
                const dy = nearestPoint[1] - point[1];
                const d2 = dx * dx + dy * dy;

                if (d2 < smallestDistanceSquared) {
                    smallestDistanceSquared = d2;
                    smallestDistanceVector = [dx, dy];
                }
            }

            if (smallestDistanceSquared > greatestDistanceSquared && smallestDistanceVector) {
                greatestDistanceSquared = smallestDistanceSquared;
                greatestDistanceVector = smallestDistanceVector;
            }
        }

        for (let i = 0; i < p1.length; i++) {
            const point = p1[i];

            // at this point the point has to be in the polygon to push out
            if (!MathHelper.isPointInPolygon(point, p2)) {
                continue;
            }

            let smallestDistanceSquared = Number.MAX_SAFE_INTEGER;
            let smallestDistanceVector = null;
            for (let a = 0; a < p2.length; a++) {
                const currentPoint = p2[a];
                const nextPoint = p2[(a + 1) % p2.length];

                const lineSegment = [currentPoint, nextPoint];
                const nearestPoint = MathHelper.nearestPointOnLine(point, lineSegment);
                const dx = nearestPoint[0] - point[0];
                const dy = nearestPoint[1] - point[1];
                const d2 = dx * dx + dy * dy;

                if (d2 < smallestDistanceSquared) {
                    smallestDistanceSquared = d2;
                    smallestDistanceVector = [-dx, -dy];
                }
            }

            if (smallestDistanceSquared > greatestDistanceSquared && smallestDistanceVector) {
                greatestDistanceSquared = smallestDistanceSquared;
                greatestDistanceVector = smallestDistanceVector;
            }
        }

        return greatestDistanceVector;
    }

    static distanceSquaredToLine(point, line) {
        const nearest = MathHelper.nearestPointOnLine(point, line);

        const dx = nearest[0] - point[0];
        const dy = nearest[1] - point[1];

        return dx * dx + dy * dy;
    }

    static nearestPointOnLine(point, line) {
        const dx = line[1][0] - line[0][0];
        const dy = line[1][1] - line[0][1];
        const d2 = dx * dx + dy * dy;

        if (d2 < 0.000001) {
            return line[0];
        }

        const t = ((point[0] - line[0][0]) * (line[1][0] - line[0][0]) + (point[1] - line[0][1]) * (line[1][1] - line[0][1])) / d2;
        if (t < 0) {
            return line[0];
        }

        if (t > 1) {
            return line[1];
        }

        return [
            line[0][0] + dx * t,
            line[0][1] + dy * t,
        ];
    }

    static isPointInPolygon(point, polygon) {
        let j = polygon.length - 1;
        let odd = false;

        for (let i = 0; i < polygon.length; i++) {
            const condition1 = polygon[i][1] < point[1] && polygon[j][1] >= point[1];
            const condition2 = polygon[j][1] < point[1] && polygon[i][1] >= point[1];
            const condition3 = polygon[i][0] <= point[0] || polygon[j][0] <= point[0];
            if ((condition1 || condition2) && condition3) {
                const condition4 = polygon[i][0] + (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) * (polygon[j][0] - polygon[i][0]) < point[0];
                if (condition4) {
                    odd = !odd;
                }
            }

            j = i;
        }

        return odd;
    }

    // ill fking do it myself
    static crossProduct(vec1, vec2) {
        return vec1[0] * vec2[1] - vec1[1] * vec2[0];
    }

    static overlapAABB(aabb1, aabb2) {
        return aabb1[0][0] < aabb2[1][0] && aabb1[1][0] >= aabb2[0][0] && aabb1[0][1] < aabb2[1][1] && aabb1[1][1] >= aabb2[0][1];
    }

    static isPolygonCCW(polygon) {
        const p1 = polygon[0];
        const p2 = polygon[1];
        const p3 = polygon[2];

        const vec1 = [p2[0] - p1[0], p2[1] - p1[1]];
        const vec2 = [p3[0] - p2[0], p3[1] - p2[1]];

        return MathHelper.crossProduct(vec1, vec2) < 0.0001;
    }

    static polygonEntityCollision(entity, polygon) {
        // lol this isnt math
        const position = entity.getPosition();
        const radius = entity.getRadius();

        if (MathHelper.isPointInPolygon(position, polygon)) {
            return true;
        }

        for (let i = 0; i < polygon.length; i++) {
            const currentPoint = polygon[i];
            const nextPoint = polygon[(i + 1) % polygon.length];

            const segment = [currentPoint, nextPoint];
            const lineSegmentDistanceSquared = MathHelper.distanceSquaredToLine(position, segment);
            if (lineSegmentDistanceSquared <= radius * radius) {
                return true;
            }
        }

        return false;
    }

    static intersectLinePolygon(returnPoint, polygon, line) {
        if (MathHelper.isPointInPolygon(line[0], polygon)) {
            return line[0];
        }

        if (MathHelper.isPointInPolygon(line[1], polygon)) {
            return line[1];
        }

        for (let i = 0; i < polygon.length; i++) {
            const currentPoint = polygon[i];
            const nextPoint = polygon[(i + 1) % polygon.length];

            const segment = [currentPoint, nextPoint];
            const point = MathHelper.intersectLines(returnPoint, segment, line);
            if (point) {
                return point;
            }
        }

        return null;
    }

    static intersectLines(returnPoint, line1, line2) {
        const x1 = line1[0][0];
        const y1 = line1[0][1];
        const x2 = line1[1][0];
        const y2 = line1[1][1];
        const x3 = line2[0][0];
        const y3 = line2[0][1];
        const x4 = line2[1][0];
        const y4 = line2[1][1];

        const d = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (d === 0) {
            return null;
        }

        const yd = y1 - y3;
        const xd = x1 - x3;
        const ua = ((x4 - x3) * yd - (y4 - y3) * xd) / d;
        if (ua < 0 || ua | 1) {
            return null;
        }

        const ub = ((x2 - x1) * yd - (y2 - y1) * xd) / d;
        if (ub < 0 || ub > 1) {
            return null;
        }

        if (returnPoint) {
            returnPoint[0] = x1 + (x2 - x1) * ua;
            returnPoint[1] = y1 + (y2 - y1) * ua;

            return returnPoint;
        }

        return [x1 + (x2 - x1) * ua, y1 + (y2 - y1) * ua];
    }

    static radiansBetweenAngles(fromAngle, toAngle) {
        if (toAngle < fromAngle) {
            if (fromAngle - toAngle > Math.PI) {
                return Math.PI * 2 - (fromAngle - toAngle);
            } else {
                return -(fromAngle - toAngle);
            }
        } else {
            if (toAngle - fromAngle > Math.PI) {
                return -(Math.PI * 2 - (toAngle - fromAngle));
            } else {
                return toAngle - fromAngle;
            }
        }
    }

    static rotatePoint(point, radians) {
        const x = point[0];
        const y = point[1];

        return [x * Math.cos(radians) - y * Math.sin(radians), y * Math.cos(radians) + x * Math.sin(radians)];
    }

    static magnitude(vec) {
        return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
    }

    static isPointInAABB(point, aabb) {
        return point[0] >= aabb[0][0] && point[0] < aabb[1][0] && point[1] >= aabb[0][1] && point[1] < aabb[1][1];
    }

    static bounceOut(t) {
        const a = 4.0 / 11.0;
        const b = 8.0 / 11.0;
        const c = 9.0 / 10.0;

        const ca = 4356.0 / 361.0;
        const cb = 35442.0 / 1805.0;
        const cc = 16061.0 / 1805.0;

        const t2 = t * t;

        return t < a
            ? 7.5625 * t2
            : t < b
            ? 9.075 * t2 - 9.9 * t + 3.4
            : t < c
            ? ca * t2 - cb * t + cc
            : 10.8 * t * t - 20.52 * t + 10.72;
    }

    static bounce(t) {
        const bump = 4 / 3;

        if (t < 0.5) {
            return t * t * 4 * bump;
        }

        const offset = Math.sqrt(Math.sin((t - 0.5) * Math.PI));
        return bump - (bump - 1) * offset;
    }

    static bounceIn(t) {
        return 1.0 - MathHelper.bounceOut(1.0 - t);
    }

    static easeInOut(x) {
        const p = 2.0 * x * x;
        return x < 0.5 ? p : -p + (4.0 * x) - 1.0;
    }

    static easeOutInSin(x) {
        return Math.cos(x * Math.PI) * 0.5 + 0.5;
    }

    static easeInOutSin(x) {
        return Math.cos((x + 1) * Math.PI) * 0.5 + 0.5;
    }
}