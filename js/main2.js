
  var container, stats;

  var camera, scene, renderer, material, mesh, colorRampTexture;

  var uniforms;

  var counter = 0;

  var soundAnalyser;

  var texture;

  init();
  animate();

  function init() {

    container = document.getElementById( 'container' );

    soundAnalyser = SoundAnalyser();
    soundAnalyser.connectTrack('music/Amok.mp3');
    

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

    var rwidth = 512, rheight = 2, rsize = rwidth * rheight;

    var dataColor = new Uint8Array( rsize * 6 );

    for ( var i = 0; i < rsize; i ++ ) {

        var h = i / 255;
        
        dataColor[ i * 3 ]     = Math.floor( Math.sin(i * Math.PI / 180.) * 255 );
        dataColor[ i * 3 + 1 ] = dataColor[ i * 3 ];
        dataColor[ i * 3 + 2 ] = dataColor[ i * 3 ];

    }

    colorRampTexture = new THREE.DataTexture( dataColor, rwidth, rheight, THREE.RGBFormat );
    colorRampTexture.needsUpdate = true
    texture = new THREE.DataTexture(soundAnalyser.getData(), 512, 2, THREE.RGBFormat);
    
    // texture = new THREE.DataTexture(test, 512, 2, THREE.LuminanceFormat, THREE.UnsignedIntType);
    // texture = THREE.ImageUtils.loadTexture( 'test.jpg' );
    uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      iChannel0: { type: 't', value: colorRampTexture }
    };

    console.log(colorRampTexture)

    material = new THREE.ShaderMaterial( {

      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

    onWindowResize();

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize( event ) {

    renderer.setSize( window.innerWidth, window.innerHeight );

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;

  }

  //

  function animate() {

    requestAnimationFrame( animate );

    counter++;
    if (counter % 120) {
      console.log(mesh.material.uniforms.iChannel0.value.image.data)
    }

    render();


  }

  function render() {

    uniforms.time.value += 0.05;
    var rwidth = 512, rheight = 2, rsize = rwidth * rheight;

    var dataColor = new Uint8Array( rsize * 6 );

    for ( var i = 0; i < rsize; i ++ ) {

        dataColor[ i * 3 ]     = Math.floor( Math.random() * 255 );
        dataColor[ i * 3 + 1 ] = dataColor[ i * 3 ];
        dataColor[ i * 3 + 2 ] = dataColor[ i * 3 ];
    }

    // texture = new THREE.DataTexture(soundAnalyser.getData(), 512, 2, THREE.RGBFormat);
    uniforms.iChannel0.value.image.data = dataColor;
    

    renderer.render( scene, camera );

  }