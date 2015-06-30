var container,
  texture,
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

  var soundAnalyser = SoundAnalyser();
  soundAnalyser.connectTrack('music/Amok.mp3')
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

  texture = new THREE.DataTexture(soundAnalyser.getData(), 1024, 2, THREE.RGBFormat);

  var uniforms = { 
              tMatCap: { 
                  type: 't', 
                  value: THREE.ImageUtils.loadTexture( 'matcap2.jpg' ) 
              },
              iChannel0: { 
                  type: 't', 
                  value: texture 
              },
              time: { // float initialized to 0
                type: "f", 
                value: 0.0 
              }
            }

  // create a wireframe material    
  material = new THREE.ShaderMaterial( {

      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      shading: THREE.SmoothShading
      
  } );

  material.uniforms.iChannel0.value.minFilter = THREE.NearestFilter;
  material.uniforms.iChannel0.value.wrapS = 
  material.uniforms.iChannel0.value.wrapT = 
  THREE.MirroredRepeatWrapping;

  material.needsUpdate = true;
  material.uniforms.iChannel0.value.needsUpdate = true;

  var modifier = new THREE.SubdivisionModifier( 3 );

  var smooth = new THREE.BoxGeometry(20, 20, 20);

  // mergeVertices(); is run in case of duplicated vertices
  smooth.mergeVertices();
  smooth.computeFaceNormals();
  smooth.computeVertexNormals();

  modifier.modify( smooth );

  // create a sphere and assign the material
  mesh = new THREE.Mesh( 
    // new THREE.IcosahedronGeometry( 20, 4 ), 
    new THREE.TorusKnotGeometry(20, 4, 248, 16, 2, 6  ),
    // new THREE.PlaneGeometry(20, 20, 512, 32),
    // new THREE.CylinderGeometry( 10, 10, 40, 32, 32 ),
    // smooth,
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

  function animate() {

    requestAnimationFrame( animate );

    // counter++;
    // if (counter % 120 === 0) {
    //   console.log(mesh.material.uniforms.iChannel0.value.image.data)
    // }

    render();


  }

  function render() {

    uniforms.time.value += 0.0025;
    // for ( var i = 0; i < 1024; i ++ ) {

    //     uniforms.iChannel0.value.image.data[ i * 3 ]     = Math.floor( Math.abs(Math.sin((i + 120000) * Math.PI / 180. + uniforms.time.value)) * 255 );
    //     uniforms.iChannel0.value.image.data[ i * 3 + 1 ] = uniforms.iChannel0.value.image.data[ i * 3 ];
    //     uniforms.iChannel0.value.image.data[ i * 3 + 2 ] = uniforms.iChannel0.value.image.data[ i * 3 ];
    // }
    
    uniforms.iChannel0.value.image.data = soundAnalyser.getData();

    // texture = new THREE.DataTexture(soundAnalyser.getData(), 512, 2, THREE.RGBFormat);
    // uniforms.iChannel0.value.image.data = dataColor;
    uniforms.iChannel0.value.needsUpdate = true

    renderer.render( scene, camera );

  }
});
