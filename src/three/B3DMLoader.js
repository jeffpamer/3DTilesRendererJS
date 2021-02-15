import { B3DMLoaderBase } from '../base/B3DMLoaderBase.js';
import { DefaultLoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class B3DMLoader extends B3DMLoaderBase {

	constructor( manager = DefaultLoadingManager ) {

		super();
		this.manager = manager;

	}

	parse( buffer ) {

		const b3dm = super.parse( buffer );
		const gltfBuffer = b3dm.glbBytes.slice().buffer;
		return new Promise( ( resolve, reject ) => {

			const manager = this.manager;
			const fetchOptions = this.fetchOptions;
			const loader = manager.getHandler( 'path.gltf' ) || new GLTFLoader( manager );

			if ( fetchOptions.credentials === 'include' && fetchOptions.mode === 'cors' ) {

				loader.setCrossOrigin( 'use-credentials' );

			}

			if ( 'credentials' in fetchOptions ) {

				loader.setWithCredentials( fetchOptions.credentials === 'include' );

			}

			if ( fetchOptions.header ) {

				loader.setRequestHeader( fetchOptions.header );

			}

			loader.parse( gltfBuffer, this.workingPath, model => {

				const { batchTable, featureTable } = b3dm;
				const { scene } = model;

				const rtcCenter = featureTable.getData( 'RTC_CENTER' );
				if ( rtcCenter ) {

					scene.position.x += rtcCenter[ 0 ];
					scene.position.y += rtcCenter[ 1 ];
					scene.position.z += rtcCenter[ 2 ];

				}

				model.batchTable = batchTable;
				model.featureTable = featureTable;

				scene.batchTable = batchTable;
				scene.featureTable = featureTable;

				resolve( model );

			}, reject );

		} );

	}

}
