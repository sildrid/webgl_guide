function runCode(){
  const canvas = document.querySelector("canvas");
  const gl = canvas.getContext("webgl");

  if(!gl){
    throw new Error("WebGL is not supported in this browser");
  }
  console.log("webgl context created successfuly");


  /*
   Now we will learn about the gl-matrix library:
   on a 3d plane, when we need to give perspective, positioning and rotation, we have to work with matrixes
   gl-matrix is a fast library specifically made for this use-case.
   you can work with the gl-matrix.js if you want to check the source code, but it is recommended to
   use gl-matrix-min-js on production, for the reduced size.
 */
  
  // gl-matrix example
  const mat4 = glMatrix.mat4;                       //adding a mat4 pointer for ease of use
  const testMatrix = mat4.create();                 //this function creates a nwe matrix array
  mat4.translate(testMatrix,testMatrix,[-1,-3,0]);  //mat4.translate(in, out, [x, y, z])

  // creating vertex data
  const vertexPosition = [
    //front
    0.5,0.5,0.5,
    -0.5,-0.5,0.5,
    -0.5,0.5,0.5,
    -0.5,-0.5,0.5,
    0.5,0.5,0.5,
    0.5,-0.5,0.5,

    //left
    0.5,0.5,-0.5,
    0.5,-0.5,0.5,
    0.5,0.5,0.5,
    0.5,-0.5,0.5,
    0.5,0.5,-0.5,
    0.5,-0.5,-0.5,
    
    //right
    -0.5,0.5,0.5,
    -0.5,-0.5,-0.5,
    -0.5,0.5,-0.5,
    -0.5,-0.5,-0.5,
    -0.5,0.5,0.5,
    -0.5,-0.5,0.5,

    
    //back
    0.5,-0.5,-0.5,
    0.5,0.5,-0.5,
    -0.5,-0.5,-0.5,
    -0.5,0.5,-0.5,
    -0.5,-0.5,-0.5,
    0.5,0.5,-0.5,
    


    //top
    -0.5,0.5,0.5,
    0.5,0.5,-0.5,
    0.5,0.5,0.5,
    0.5,0.5,-0.5,
    -0.5,0.5,0.5,
    -0.5,0.5,-0.5,


    //bottom
    -0.5,-0.5,-0.5,
    0.5,-0.5,0.5,
    0.5,-0.5,-0.5,
    0.5,-0.5,0.5,
    -0.5,-0.5,-0.5,
    -0.5,-0.5,0.5,
  ];
  function randomColor(){
    return [Math.random(),Math.random(), Math.random()]
  }
  const vertexColor = [];
  for(let i=0;i<vertexPosition.length/18;i++){
    let nextColor = randomColor();
    for(let j=0;j<6;j++){
      vertexColor.push(...nextColor);
    }
  }

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

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat4 matrix;

    void main() {
      vColor = color;
      gl_Position = matrix * vec4(position, 1);
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
    3,                                //number of elements per attribute
    gl.FLOAT,                         //type of elements
    gl.FALSE,                         //normalization
    3 * Float32Array.BYTES_PER_PIXEL, //size of an individual vertex
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
  gl.enable(gl.DEPTH_TEST);   //if enabled, fix overlaping isues

  const uniformPointers = {
    matrix: gl.getUniformLocation(program,"matrix")
  }
  const matrix = mat4.create();
  const projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    75*Math.PI/180,   //vertical field of view
    canvas.width/canvas.height,   //apect ratio
    0.1,  //near cull distance
    100   //far cull distance
  );
  mat4.translate(matrix,matrix,[0,0,-1.0]);
  mat4.scale(matrix,matrix,[0.25,0.25,0.25]);

  const finalMatrix = mat4.create();
  function loop(){
    
  mat4.rotateX(matrix,matrix, Math.PI/2/30);
  
  mat4.multiply(finalMatrix,projectionMatrix,matrix)
  gl.uniformMatrix4fv(uniformPointers.matrix,false,finalMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPosition.length/3);
  setTimeout(loop,60);
  }
  loop();




}
runCode();







