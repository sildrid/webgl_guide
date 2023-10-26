function runCode(){
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

  */

  // creating vertex data
  const vertexPosition = [
    0,1,
    1,-1,
    -1,-1,
  ];
  const vertexColor = [
    0,1,0,
    1,0,0,
    0,0,1
  ]

  // creating buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);

  // create the shaders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec2 position;
    attribute vec3 color;
    varying vec3 vColor;
    void main() {
      vColor = color;
      gl_Position = vec4(position, 0, 1);
    }
  `);
  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
    return;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor,1);
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
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(
    positionLocation,                 //attribute location in program
    2,                                //number of elements per attribute
    gl.FLOAT,                         //type of elements
    gl.FALSE,                         //normalization
    2 * Float32Array.BYTES_PER_PIXEL, //size of an individual vertex
    0                                 //offset from the begining of the array
  );


  const colorLocation = gl.getAttribLocation(program, "color");
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(
    colorLocation,                 //attribute location in program
    3,                                //number of elements per attribute
    gl.FLOAT,                         //type of elements
    gl.FALSE,                         //normalization
    3 * Float32Array.BYTES_PER_PIXEL, //size of an individual vertex
    0                                 //offset from the begining of the array
  );

  // selecting what shader program to use
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
runCode();







