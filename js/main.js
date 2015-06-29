var container,
  material, 
  renderer, 
  scene, 
  camera, 
  mesh, 
  start = Date.now(),
  fov = 30;

window.addEventListener( 'load', function() {

  // grab the container from the DOM
  container = document.getElementById( "container" );

  
  // create a scene
  scene = new THREE.Scene();

  // create a camera the size of the browser window
  // and place it 100 units away, looking towards the center of the scene
  camera = new THREE.PerspectiveCamera( 
    fov, 
    window.innerWidth / window.innerHeight, 
    1, 
    10000 );
  camera.position.z = 100;
  camera.target = new THREE.Vector3( 0, 0, 0 );

  scene.add( camera );

  // create a wireframe material    
  material = new THREE.ShaderMaterial( {

      uniforms: { 
          tMatCap: { 
              type: 't', 
              value: THREE.ImageUtils.loadTexture( 'matcap4.jpg' ) 
          },
          iChannel0: { 
              type: 't', 
              value: THREE.ImageUtils.loadTexture( 'simplex.jpg' ) 
          },
          time: { // float initialized to 0
            type: "f", 
            value: 0.0 
          },

      },
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      shading: THREE.SmoothShading
      
  } );

  material.uniforms.tMatCap.value.wrapS = 
  material.uniforms.tMatCap.value.wrapT = 
  THREE.ClampToEdgeWrapping;

  var modifier = new THREE.SubdivisionModifier( 4 );

  var smooth = new THREE.BoxGeometry(20, 20, 20);

  // mergeVertices(); is run in case of duplicated vertices
  smooth.mergeVertices();
  smooth.computeFaceNormals();
  smooth.computeVertexNormals();

  modifier.modify( smooth );

  // create a sphere and assign the material
  mesh = new THREE.Mesh( 
    // new THREE.IcosahedronGeometry( 20, 4 ), 
    // new THREE.TorusKnotGeometry(15, 4, 248, 16  ),
    smooth,
    material 
  );
  scene.add( mesh );
  
  // create the renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer({ antiAliasing: true, alpha: true });
  renderer.setClearColor( 0x222222, 1);
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  container.appendChild( renderer.domElement );
  var controls = new THREE.OrbitControls( camera, renderer.domElement );

  animate();

} );

function animate() {

  requestAnimationFrame( animate );

  // let there be light
  material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
  renderer.render( scene, camera );
  
}