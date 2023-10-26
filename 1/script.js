function runCode(){
  /*
    webgl is te api that lets you draw in 3d using your graphics card.
    webgl is a javascript port of opengl, it uses a "C" like language called glsl
    webgl supports opengl 2.0, for opengl 3.0 it needs webgl2.


  */
  // setting up the context
  const canvas = document.querySelector("canvas");
  const gl = canvas.getContext("webgl");

  if(!gl){
    throw new Error("WebGL is not supported in this browser");
  }
  console.log("webgl context created successfuly");


  /*
    webgl works mainly on vertex information, a vertex is a point in a 3d space.
    vertex info can have:
      coordinates (3.5, 2, -5)
      color       (#ff0539)
      normal      (0,1,0)

    webgl coordinate system is a right-handed coordinate system:
      x => increases towards the right
      y => increases going up
      z => increases towards the viewer

    webgl pipeline:
      * first we prepare the vertex data on javascript (cpu)
      * then we send it to the gpu, the gpu will store the raw vertex data in a vram.
      * we need to tell the gpu what draw with this data (lines, triangles, etc)
      * then we run the shader program:
          *vertex shader => it's main job is to correctly position every vertex on the screen
          #fragment shader => runs once for every pixel, here you can mainly manipulate colors.
      # and finally the gpu sends data to the double buffer, the main buffer is the canvas, the hidden buffer is just a helper to avoid flickering.

    the shader program can also take "uniforms", this are cpu side variables.
  */

  // creating vertex data
  const vertexData = [
    0,1,0,
    1,-1,0,
    -1,-1,0,
  ];

  // creating buffer
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);


  // loading vertex data into buffer
  // javascript arrays are normally 64 bits, and buffers work on 32bits, so we need to convert it
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  // create the shaders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `
    attribute vec3 position;
    void main() {
      gl_Position = vec4(position, 1);
    }
  `);
  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
    return;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `
    void main() {
      gl_FragColor = vec4(1,0,0,1);
    }
  `);
  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  // create a program
  const program = gl.createProgram();

  // attach the shaders to the program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // linking program to pipeline
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error("ERROR linking program", gl.getProgramInfoLog(program));
    return;
  }

  // referencing the buffer attributes
  //
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(
    positionLocation,                 //attribute location in program
    3,                                //number of elements per attribute
    gl.FLOAT,                         //type of elements
    gl.FALSE,                         //normalization
    2 * Float32Array.BYTES_PER_PIXEL, //size of an individual vertex
    0                                 //offset from the begining of the array
  );
  gl.enableVertexAttribArray(positionLocation);

  // selecting what shader program to use
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
runCode();







