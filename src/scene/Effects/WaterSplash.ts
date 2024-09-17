import { CircleGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, NearestFilter, PlaneGeometry, RepeatWrapping, RingGeometry, Scene, TextureLoader, Vector3 } from "three";

class WaterSplash {

    private scene: Scene
    private mesh: Mesh
    private animationId
    
    private scaleFactor = 1.01
    private opacityFactor = 0.98
    private opacity = 1

    constructor(origin: Vector3) {
        if( window.hasOwnProperty('scene') )
            this.scene = window['scene'] as Scene
        const ori = new Vector3().copy(origin)
        ori.z = 0.1

        const splashGeo = new RingGeometry(9.7, 10)
        const splashMaterial = new MeshBasicMaterial({color: 0xddddFF})
        this.mesh = new Mesh(splashGeo, splashMaterial)
        splashMaterial.transparent = true
        this.mesh.receiveShadow = false
        this.mesh.castShadow = true
        this.mesh.position.set(ori.x, ori.y, ori.z)
        
        console.log(this.scene.children)
        this.scene.add(this.mesh)
        console.log(this.scene.children)

        this.update()
        
        setTimeout(() => {
            this.stop()
        }, 1000)
    }

    private update = () => {
        this.mesh.geometry.scale(this.scaleFactor, this.scaleFactor, 1)

        this.opacity = this.opacityFactor * this.opacity
        this.mesh.material.opacity = this.opacity
        this.animationId = requestAnimationFrame(this.update)
    }

    private stop = () => {
        cancelAnimationFrame(this.animationId)
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export default WaterSplash