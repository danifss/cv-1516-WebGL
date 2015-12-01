//////////////////////////////////////////////////////////////////////////////
//
//  core.js
//
//  Applying a texture and blending
//
//  Adapted from practical classes
//
//  Daniel Silva - 51908
//  João Cravo   - 63784
//
//  Visual Computation - 2015
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context
var shaderProgram = null;

// --- Buffers
var cubeVertexPositionBuffer = null;
var cubeVertexIndexBuffer = null;
var cubeVertexTextureCoordBuffer;

// The global transformation parameters
var globalAngleYY = 0.0;
var globalTz = 0.0;

// The translation vector
var tx = 0.0;
var ty = 0.0;
var tz = 0.0;

// The rotation angles in degrees
var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;

// The scaling factors
var sx = 0.1;
var sy = 0.1;
var sz = 0.1;

// GLOBAL Animation controls
var globalRotationYY_ON = 1;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;

// Local Animation controls
var rotationXX_ON = 1;
var rotationXX_DIR = 1;
var rotationXX_SPEED = 1;
var rotationYY_ON = 1;
var rotationYY_DIR = 1;
var rotationYY_SPEED = 1;
var rotationZZ_ON = 1;
var rotationZZ_DIR = 1;
var rotationZZ_SPEED = 1;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;

// To allow choosing the projection type
var projectionType = 0;

//To allow choosing the algorithm to sort
var algorithmType = 0;

// --- Model Material Features
// Ambient coef.
var kAmbi = [ 0.2, 0.2, 0.2 ];

// Difuse coef.
var kDiff = [ 0.7, 0.7, 0.7 ];

// Specular coef.
var kSpec = [ 0.7, 0.7, 0.7 ];

// Phong coef.
var nPhong = 100;

// --- Storing the vertices defining the cube faces
vertices = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
];

// Texture coordinates for the quadrangular faces
// Notice how they are assigne to the corresponding vertices
var textureCoords = [

    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];

// Vertex indices defining the triangles
var cubeVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
];

// Initial model has just ONE TRIANGLE
var vertices = [
    // FRONTAL TRIANGLE
    -0.5, -0.5,  0.5,
    0.5, -0.5,  0.5,
    0.5,  0.5,  0.5,
];

var normals = [
    // FRONTAL TRIANGLE
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
];

// Initial color values just for testing!!
// They are to be computed by the Phong Illumination Model
var colors = [
    // FRONTAL TRIANGLE
    1.00,  0.00,  0.00,
    1.00,  0.00,  0.00,
    1.00,  0.00,  0.00,
];

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Textures
// From www.learningwebgl.com
function handleLoadedTexture(texture) {

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var webGLTexture;

function initTexture() {
    webGLTexture = gl.createTexture();
    webGLTexture.image = new Image();
    webGLTexture.image.onload = function () {
        handleLoadedTexture(webGLTexture)
    }

    webGLTexture.image.src = "gito.jpg";
}

//----------------------------------------------------------------------------

// Handling the Buffers

function initBuffers() {
    // Coordinates
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = vertices.length / 3;

    // Textures
    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;

    // Vertex indices
    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

//----------------------------------------------------------------------------

//  Computing the illumination and rendering the model

function computeIllumination( mvMatrix ) {
    // Phong Illumination Model
    // Clearing the colors array
    for( var i = 0; i < colors.length; i++ )
    {
        colors[i] = 0.0;
    }

    // SMOOTH-SHADING
    // Compute the illumination for every vertex
    // Iterate through the vertices
    for( var vertIndex = 0; vertIndex < vertices.length; vertIndex += 3 )
    {
        // For every vertex
        // GET COORDINATES AND NORMAL VECTOR
        var auxP = vertices.slice( vertIndex, vertIndex + 3 );
        var auxN = normals.slice( vertIndex, vertIndex + 3 );

        // CONVERT TO HOMOGENEOUS COORDINATES
        auxP.push( 1.0 );
        auxN.push( 0.0 );

        // APPLY CURRENT TRANSFORMATION
        var pointP = multiplyPointByMatrix( mvMatrix, auxP );
        var vectorN = multiplyVectorByMatrix( mvMatrix, auxN );
        normalize( vectorN );

        // VIEWER POSITION
        var vectorV = vec3();
        if( projectionType == 0 ) {
            // Orthogonal
            vectorV[2] = 1.0;
        }
        else {
            // Perspective
            // Viewer at ( 0, 0 , 0 )
            vectorV = symmetric( pointP );
        }

        normalize( vectorV );

        // Compute the 3 components: AMBIENT, DIFFUSE and SPECULAR
        // FOR EACH LIGHT SOURCE
        for(var l = 0; l < lightSources.length; l++ )
        {
            if( lightSources[l].isOff() ) {
                continue;
            }

            // INITIALIZE EACH COMPONENT, with the constant terms
            var ambientTerm = vec3();
            var diffuseTerm = vec3();
            var specularTerm = vec3();

            // For the current light source
            ambient_Illumination = lightSources[l].getAmbIntensity();
            int_Light_Source = lightSources[l].getIntensity();
            pos_Light_Source = lightSources[l].getPosition();

            // Animating the light source, if defined
            var lightSourceMatrix = mat4();

            // COMPLETE THE CODE FOR THE OTHER ROTATION AXES
            if( lightSources[l].isRotYYOn() )
            {
                lightSourceMatrix = mult(
                    lightSourceMatrix,
                    rotationYYMatrix( lightSources[l].getRotAngleYY() ) );
            }

            for( var i = 0; i < 3; i++ )
            {
                // AMBIENT ILLUMINATION --- Constant for every vertex
                ambientTerm[i] = ambient_Illumination[i] * kAmbi[i];
                diffuseTerm[i] = int_Light_Source[i] * kDiff[i];
                specularTerm[i] = int_Light_Source[i] * kSpec[i];
            }

            // DIFFUSE ILLUMINATION
            var vectorL = vec4();
            if( pos_Light_Source[3] == 0.0 )
            {
                // DIRECTIONAL Light Source
                vectorL = multiplyVectorByMatrix(
                    lightSourceMatrix,
                    pos_Light_Source );
            }
            else
            {
                // POINT Light Source
                // TO DO : apply the global transformation to the light source?
                vectorL = multiplyPointByMatrix(
                    lightSourceMatrix,
                    pos_Light_Source );

                for( var i = 0; i < 3; i++ )
                {
                    vectorL[ i ] -= pointP[ i ];
                }
            }

            // Back to Euclidean coordinates
            vectorL = vectorL.slice(0,3);
            normalize( vectorL );
            var cosNL = dotProduct( vectorN, vectorL );
            if( cosNL < 0.0 )
            {
                // No direct illumination !!
                cosNL = 0.0;
            }

            // SEPCULAR ILLUMINATION
            var vectorH = add( vectorL, vectorV );
            normalize( vectorH );
            var cosNH = dotProduct( vectorN, vectorH );

            // No direct illumination or viewer not in the right direction
            if( (cosNH < 0.0) || (cosNL <= 0.0) )
            {
                cosNH = 0.0;
            }

            // Compute the color values and store in the colors array
            var tempR = ambientTerm[0] + diffuseTerm[0] * cosNL + specularTerm[0] * Math.pow(cosNH, nPhong);
            var tempG = ambientTerm[1] + diffuseTerm[1] * cosNL + specularTerm[1] * Math.pow(cosNH, nPhong);
            var tempB = ambientTerm[2] + diffuseTerm[2] * cosNL + specularTerm[2] * Math.pow(cosNH, nPhong);

            colors[vertIndex] += tempR;

            // Avoid exceeding 1.0

            if( colors[vertIndex] > 1.0 ) {
                colors[vertIndex] = 1.0;
            }

            // Avoid exceeding 1.0
            colors[vertIndex + 1] += tempG;
            if( colors[vertIndex + 1] > 1.0 ) {
                colors[vertIndex + 1] = 1.0;
            }
            colors[vertIndex + 2] += tempB;

            // Avoid exceeding 1.0
            if( colors[vertIndex + 2] > 1.0 ) {
                colors[vertIndex + 2] = 1.0;
            }
        }
    }
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( angleXX, angleYY, angleZZ,
                    sx, sy, sz,
                    tx, ty, tz,
                    mvMatrix,
                    primitiveType ) {

    // Pay attention to transformation order !!
    mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
    mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );
    mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
    mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );
    mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

    // Passing the Model View Matrix to apply the current transformation
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Aux. Function for computing the illumination
    //computeIllumination( mvMatrix );

    // Passing the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // --- Textures
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, webGLTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // --- Blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    var alpha = 0.5
    gl.uniform1f(shaderProgram.alphaUniform, alpha);

    // The vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    // Drawing the triangles --- DRAWING ELEMENTS
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
    var pMatrix;
    var mvMatrix = mat4();

    // Clearing with the background color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // --- Computing the Projection Matrix
    if( projectionType == 0 ) {
        // For now, the default orthogonal view volume
        pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
        tz = 0;

        // Allow the user to control the size of the view volume
        // TO BE DONE ID NEEDED!
    }
    else {
        // A standard view volume.
        // Viewer is at (0,0,0)
        // Ensure that the model is "inside" the view volume
        pMatrix = perspective( 45, 1, 0.05, 10 );
        tz = -2.25;

    }

    // Passing the Projection Matrix to apply the current projection

    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

    // --- Instantianting the same model more than once !!
    // And with diferent transformation parameters !!
    // Call the drawModel function !!

    // Instance 1 --- RIGHT TOP
    drawModel( -angleXX, angleYY, angleZZ,
        sx, sy, sz,
        tx + 0.5, ty + 0.5, tz,
        mvMatrix,
        primitiveType );

    // Instance 2 --- LEFT TOP
    drawModel( -angleXX, -angleYY, -angleZZ,  // CW rotations
        sx, sy, sz,
        tx - 0.5, ty + 0.5, tz,
        mvMatrix,
        primitiveType );

    // Instance 3 --- LEFT BOTTOM
    drawModel( angleXX, angleYY, -angleZZ,
        sx, sy, sz,
        tx + 0.5, ty - 0.5, tz,
        mvMatrix,
        primitiveType );

    // Instance 4 --- RIGHT BOTTOM
    drawModel( angleXX, -angleYY, angleZZ,  // CW rotations
        sx, sy, sz,
        tx - 0.5, ty - 0.5, tz,
        mvMatrix,
        primitiveType );


}

//----------------------------------------------------------------------------
//
//  --- Animation
//

// Animation --- Updating transformation parameters
var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if( lastTime != 0 ) {
        var elapsed = timeNow - lastTime;
        // Global rotation
        if( globalRotationYY_ON ) {
            globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
        }
        if( rotationXX_ON ) {
            angleXX += rotationXX_DIR * rotationXX_SPEED * (90 * elapsed) / 1000.0;
        }
        if( rotationYY_ON ) {
            angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
        }
        if( rotationZZ_ON ) {
            angleZZ += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
        }
        // Rotating the light sources
        if( lightSources[0].isRotYYOn() ) {
            var angle = lightSources[0].getRotAngleYY() + (90 * elapsed) / 1000.0;
            lightSources[0].setRotAngleYY( angle );
        }
    }
    lastTime = timeNow;
}

//----------------------------------------------------------------------------

// Handling keyboard events

// Adapted from www.learningwebgl.com
var currentlyPressedKeys = {};

function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        sx *= 0.9;
        sz = sy = sx;
    }
    if (currentlyPressedKeys[34]) {
        // Page Down
        sx *= 1.1;
        sz = sy = sx;
    }
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        if( rotationYY_ON == 0 ) {
            rotationYY_ON = 1;
        }
        rotationYY_SPEED -= 0.25;
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        if( rotationYY_ON == 0 ) {
            rotationYY_ON = 1;
        }
        rotationYY_SPEED += 0.25;
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        if( rotationXX_ON == 0 ) {
            rotationXX_ON = 1;
        }
        rotationXX_SPEED -= 0.25;
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        if( rotationXX_ON == 0 ) {
            rotationXX_ON = 1;
        }
        rotationXX_SPEED += 0.25;
    }
}

//----------------------------------------------------------------------------

// Handling mouse events

// Adapted from www.learningwebgl.com
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    // Rotation angles proportional to cursor displacement
    var newX = event.clientX;
    var newY = event.clientY;
    var deltaX = newX - lastMouseX;
    angleYY += radians( 10 * deltaX  )
    var deltaY = newY - lastMouseY;
    angleXX += radians( 10 * deltaY  )
    lastMouseX = newX
    lastMouseY = newY;
}

//----------------------------------------------------------------------------

// Timer

function tick() {
    requestAnimFrame(tick);
    // Processing keyboard events
    handleKeys();
    drawScene();
    animate();
}

//----------------------------------------------------------------------------

function setEventListeners( canvas ){

    // ---Handling the mouse
    // From learningwebgl.com
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    // ---Handling the keyboard
    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }
    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    // ---Handling HTML elements
    // Dropdown list
    var projection = document.getElementById("projection-selection");
    projection.addEventListener("click", function(){
        // Getting the selection
        var p = projection.selectedIndex;
        switch(p){
            case 0 : projectionType = 0;
                break;
            case 1 : projectionType = 1;
                break;
        }
    });

    // Button events
    document.getElementById("XX-on-off-button").onclick = function(){
        // Switching on / off
        if( rotationXX_ON )
            rotationXX_ON = 0;
        else
            rotationXX_ON = 1;
    };
    document.getElementById("XX-direction-button").onclick = function(){
        // Switching the direction
        if( rotationXX_DIR == 1 )
            rotationXX_DIR = -1;
        else
            rotationXX_DIR = 1;
    };
    document.getElementById("XX-slower-button").onclick = function(){
        rotationXX_SPEED *= 0.75;
    };
    document.getElementById("XX-faster-button").onclick = function(){
        rotationXX_SPEED *= 1.25;
    };
    document.getElementById("YY-on-off-button").onclick = function(){
        // Switching on / off
        if( rotationYY_ON )
            rotationYY_ON = 0;
        else
            rotationYY_ON = 1;
    };
    document.getElementById("YY-direction-button").onclick = function(){
        // Switching the direction
        if( rotationYY_DIR == 1 )
            rotationYY_DIR = -1;
        else
            rotationYY_DIR = 1;
    };
    document.getElementById("YY-slower-button").onclick = function(){
        rotationYY_SPEED *= 0.75;
    };
    document.getElementById("YY-faster-button").onclick = function(){
        rotationYY_SPEED *= 1.25;
    };
    document.getElementById("ZZ-on-off-button").onclick = function(){
        // Switching on / off
        if( rotationZZ_ON )
            rotationZZ_ON = 0;
        else
            rotationZZ_ON = 1;
    };
    document.getElementById("ZZ-direction-button").onclick = function(){
        // Switching the direction
        if( rotationZZ_DIR == 1 )
            rotationZZ_DIR = -1;
        else
            rotationZZ_DIR = 1;
    };
    document.getElementById("ZZ-slower-button").onclick = function(){
        rotationZZ_SPEED *= 0.75;
    };
    document.getElementById("ZZ-faster-button").onclick = function(){
        rotationZZ_SPEED *= 1.25;
    };
    document.getElementById("reset-button").onclick = function(){
        // The initial values
        tx = 0.0;
        ty = 0.0;
        tz = 0.0;
        angleXX = 0.0;
        angleYY = 0.0;
        angleZZ = 0.0;
        sx = 0.1;
        sy = 0.1;
        sz = 0.1;
        rotationXX_ON = 0;
        rotationXX_DIR = 1;
        rotationXX_SPEED = 1;
        rotationYY_ON = 0;
        rotationYY_DIR = 1;
        rotationYY_SPEED = 1;
        rotationZZ_ON = 0;
        rotationZZ_DIR = 1;
        rotationZZ_SPEED = 1;
    };
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
    try {
        // Create the WebGL context
        // Some browsers still need "experimental-webgl"
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        // DEFAULT: The viewport occupies the whole canvas
        // DEFAULT: The viewport background color is WHITE

        // - Drawing the triangles defining the model
        primitiveType = gl.TRIANGLES;
        // DEFAULT: Blending is DISABLED
        // Enable it !
        gl.enable( gl.BLEND );
    } catch (e) { }

    if (!gl) {
        alert("Could not initialise WebGL, sorry! :-(");
    }
}

//----------------------------------------------------------------------------

function runWebGL() {
    var canvas = document.getElementById("my-canvas");
    initWebGL( canvas );
    shaderProgram = initShaders( gl );
    setEventListeners( canvas );
    initBuffers();
    initTexture();
    tick(); // A timer controls the rendering / animation
    //outputInfos();
}
