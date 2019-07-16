var Geometry = {};

Geometry.subtractPoint = (p1, p2) => [p1[0]-p2[0],p1[1]-p2[1], p1[2]-p2[2]];

Geometry.addPoint = (p1, p2) => [p1[0]+p2[0],p1[1]+p2[1],p1[2]+p2[2]];

Geometry.midPoint = (p1,p2) => [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2, (p1[2]+p2[2])/2];

Geometry.getDistance = (p1,p2) => Math.sqrt(Math.pow(p2[1]-p1[1],2) +  Math.pow(p2[0]-p1[0],2));

Geometry.getDirection = (p1,p2) => Math.atan2(p2[1]-p1[1],p2[0]-p1[0]);

Geometry.getVector = function( args ) {
    let direction, magnitude;
    if ((args.start != null) && (args.end != null)) {
        magnitude = Geometry.getDistance(args.start, args.end);
        direction = Geometry.getDirection(args.start, args.end);
    } else if ((args.direction != null) && (args.magnitude != null)) {
        ({ magnitude } = args);
        ({ direction } = args);
    } else {
        throw 'missing required arguments';
    }

    return {magnitude, direction};
};

Geometry.getOrthogonalVector = vector => ({magnitude: vector.magnitude, direction: vector.direction + (Math.PI/2)});

Geometry.movePoint = function(point, vector) {
    const radians = vector.direction;
    const matrix = [
        [Math.cos(radians),-Math.sin(radians)],
        [Math.sin(radians), Math.cos(radians)]
    ];
    const movePoint = Geometry.transformPoint([vector.magnitude,0], matrix);
    return Geometry.addPoint(point,movePoint);
};

Geometry.getPointIntersected = function( line1, line2 ) {
    const result = Geometry.checkLineIntersection( line1[0][0], line1[0][1], line1[1][0], line1[1][1],
        line2[0][0], line2[0][1], line2[1][0], line2[1][1]);
    return [result.x, result.y];
};

Geometry.checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    let denominator = undefined;
    let a = undefined;
    let b = undefined;
    let numerator1 = undefined;
    let numerator2 = undefined;
    const result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };

    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator === 0) { return result; }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));

    //
    //        // it is worth noting that this should be the same as:
    //        x = line2StartX + (b * (line2EndX - line2StartX));
    //        y = line2StartX + (b * (line2EndY - line2StartY));
    //

    // if line1 is a segment and line2 is infinite, they intersect if:
    if ((a > 0) && (a < 1)) { result.onLine1 = true; }

    // if line2 is a segment and line1 is infinite, they intersect if:
    if ((b > 0) && (b < 1)) { result.onLine2 = true; }

    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

export { Geometry }