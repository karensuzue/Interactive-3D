"use strict";

// const { ENETRESET } = require("constants");

var canvas;
var gl;
var thetaLoc;
var points = [];
var colors = [];

const vertices = [
    vec4( 0.5, -0.5, 0.0, 1.0 ),
    vec4( 0.0, -0.5, 0.5, 1.0 ),
    vec4( -0.5, -0.5, 0.0, 1.0 ),
    vec4( 0.0, -0.5, -0.5, 1.0 ),
    vec4( 0.0, 0.5, 0.0, 1.0 ),
];

const vertexColors = [
    [ 1.0, 0.0, 1.0, 1.0 ], // magenta
    [ 1.0, 0.0, 0.0, 1.0 ], // red
    [ 1.0, 1.0, 0.0, 1.0 ], // yellow
    [ 0.0, 1.0, 0.0, 1.0 ], // green
    [ 0.0, 0.0, 1.0, 1.0 ], // blue
];

var x_axis = 0;
var y_axis = 0;
var z_axis = 0;


var theta = vec3(0, 0, 0);

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    colorPyramid();
    drawAxis();

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform3fv(thetaLoc, flatten(theta));

    document.getElementById("submit").onclick = function(){
        enter();
    };

    document.getElementById("reset").onclick = function() {
        reset();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    render();
}

function drawAxis() {
    points.push(vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0));
    colors.push(vertexColors[1], vertexColors[1], vertexColors[3], vertexColors[3], 
        vertexColors[4], vertexColors[4]);
}

function colorPyramid() { // function creates entire pyramid
    triangle(4, 1, 0); // each face of the pyramid, numbers show order of vertices
    triangle(0, 3, 4);
    triangle(3, 2, 4);
    triangle(1, 4, 2);
    quad(2, 1, 0, 3);
}

function quad(a, b, c, d) { // helper function for quad face
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
    }
}

function triangle(a, b, c) { // helper function for triangle face
    var indices = [a, b, c];
    for (var i = 0; i < indices.length; i++) {
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]); // no color interpolation
    }    
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, flatten(theta));
    
    gl.drawArrays(gl.TRIANGLES, 0, points.length - 6);
    gl.drawArrays(gl.LINES, points.length - 6, 6);

    requestAnimationFrame(render);
}

window.onkeydown = function(event) {
    if (event.keyCode == 87) { // W, up along x axis
        theta[0] += 15;
        document.getElementById("x-axis").value = theta[0];
    }

    if (event.keyCode == 65) { // A, left along y axis 
        theta[1] += 15;
        document.getElementById("x-axis").value = theta[0];
    }

    if (event.keyCode == 83) { // S, down along x axis
        theta[0] -= 15;
        document.getElementById("x-axis").value = theta[0];
    }

    if (event.keyCode == 68) { // D right along y axis
        theta[1] -= 15;
        document.getElementById("y-axis").value = theta[1];
    }

    if (event.keyCode == 81) { // Q counterclockwise z axis
        theta[2] -= 15;
        document.getElementById("z-axis").value = theta[2];
    }

    if (event.keyCode == 69) { // E clockwise z axis
        theta[2] += 15;
        document.getElementById("z-axis").value = theta[2];
    }

    if (event.keyCode == 82) { // R reset
        reset();
    }

    if (event.keyCode == 13) { // ENTER
        enter();
    }
}

function reset() {
    theta = vec3(0, 0, 0);
    document.getElementById("x-axis").value = 0;
    document.getElementById("y-axis").value = 0;
    document.getElementById("z-axis").value = 0;
}

function enter() {
    x_axis = document.getElementById("x-axis").value;
    y_axis = document.getElementById("y-axis").value;
    z_axis = document.getElementById("z-axis").value;
    theta = vec3(x_axis, y_axis, z_axis);
}