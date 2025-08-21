import { BackSide, Box3, Box3Helper, DoubleSide, FrontSide, Group, MathUtils, Mesh, MeshBasicMaterial, MeshDepthMaterial, MeshStandardMaterial, NearestFilter, PlaneGeometry, RGBADepthPacking, RepeatWrapping, Scene, TextureLoader, Vector3 } from "three"

class WorldGenerate {

    public worldGroup: Group
    private scene: Scene
    
    constructor() {
        this.buildWorld()
    }

    private buildWorld() {
        this.scene = window['scene'] as Scene
        this.worldGroup = new Group()
        this.worldGroup.name = 'world'
        this.instantiateStem()


        const movingPlane = new PlaneGeometry(600,2000)
        const movingPlaneMaterial = new MeshStandardMaterial({color: 0x7EB2DD})
        const movingPlaneMesh = new Mesh(movingPlane, movingPlaneMaterial)
        movingPlaneMaterial.transparent = true
        movingPlaneMaterial.opacity = 0.6
        movingPlaneMaterial.metalness = 0.2
        movingPlaneMaterial.roughness = 0.5
        movingPlaneMesh.receiveShadow = true
        movingPlaneMesh.position.set(0,800,0)
        this.worldGroup.add(movingPlaneMesh)

        const rockUnderwater = new PlaneGeometry(700,2000)
        const rockUnderwaterMap = new TextureLoader().load("../public/rocks_underwater.png")
        rockUnderwaterMap.minFilter = NearestFilter
        rockUnderwaterMap.magFilter = NearestFilter
        rockUnderwaterMap.generateMipmaps = false
        rockUnderwaterMap.wrapS = RepeatWrapping
        rockUnderwaterMap.wrapT = RepeatWrapping
        rockUnderwaterMap.repeat.set( 4, 48 );
        const rockUnderwaterMaterial = new MeshBasicMaterial({map: rockUnderwaterMap})
        const rockUnderwaterMesh = new Mesh(rockUnderwater, rockUnderwaterMaterial)
        rockUnderwaterMesh.receiveShadow = false
        rockUnderwaterMesh.position.set(0,800,-20)
        this.worldGroup.add(rockUnderwaterMesh)
    }

    private instantiateStem() {
        const stemGeo = new PlaneGeometry(80,18)
        const stemMap = new TextureLoader().load("../public/stem.png")
        stemMap.minFilter = NearestFilter
        stemMap.magFilter = NearestFilter
        stemMap.generateMipmaps = false
        const stemMaterial = new MeshBasicMaterial({
            map: stemMap,
            side: FrontSide,
            shadowSide: FrontSide,
            transparent: true,
            opacity: 10,
            alphaMap: stemMap,
            alphaTest: 0.05
        })
        let stemMesh = new Mesh(stemGeo, stemMaterial)
        stemMesh.castShadow = true
        stemMesh.receiveShadow = true
        stemMesh.position.set(30,280,4)
        this.worldGroup.add(stemMesh)

        let box3 = new Box3(new Vector3(), new Vector3()).setFromObject(stemMesh)

        // const helper = new Box3Helper(box3, 0xff0000)

        // this.scene.add(helper)

        stemMesh = new Mesh(stemGeo, stemMaterial)
        stemMesh.castShadow = true
        stemMesh.receiveShadow = true
        stemMesh.position.set(-60,350,4)
        this.worldGroup.add(stemMesh)

        stemMesh = new Mesh(stemGeo, stemMaterial)
        stemMesh.castShadow = true
        stemMesh.receiveShadow = true
        stemMesh.position.set(-20,400,4)
        this.worldGroup.add(stemMesh)

        stemMesh = new Mesh(stemGeo, stemMaterial)
        stemMesh.castShadow = true
        stemMesh.receiveShadow = true
        stemMesh.position.set(30,470,4)
        this.worldGroup.add(stemMesh)
    }
}

export default WorldGenerate