import { BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import InverseKinematicMechanics from "./InverseKinematicMechanics"


class GameScene {

    // padrão de Projetos - Singleton
    private static _instance = new GameScene()
    public static get instance() {
        return this._instance
    }

    private _inverseKinematicMechanics: InverseKinematicMechanics

    private _canvas: HTMLElement
    public _width: number
    public _height: number
    private _renderer: WebGLRenderer
    public _camera: PerspectiveCamera
    public _scene: Scene

    public constructor() {
        this._canvas = document.getElementById('gameCanvas') as HTMLElement
        this._renderer = new WebGLRenderer({
            canvas: this._canvas,
            alpha: true,
            antialias: true
        })
        this._renderer.shadowMap.enabled = true
        this.setWindowSize()
        this.setDefaultScene()
        this.setRendererSize()

        addEventListener("resize", this.setRendererSize)
        this._inverseKinematicMechanics = new InverseKinematicMechanics(this)
    }

    private setWindowSize() {
        this._width = window.innerWidth
        this._height = window.innerHeight
    }
    
    private setRendererSize = () => {
        this.setWindowSize()
        this._renderer.setSize(this._width, this._height)
        this._camera.aspect = (this._width/this._height)
        this._camera.updateProjectionMatrix()
    }

    private setDefaultScene() {
        this._camera = new PerspectiveCamera(75, this._width/this._height, 0.1, 1000)
        this._camera.position.set(0, 0, 200)
        this._camera.lookAt(0,0,0)
        
        this._scene = new Scene()
    }

    public async load() {
        // let controls = new OrbitControls(this._camera, this._canvas)

        const light = new DirectionalLight(0xFFFFFF, 1)
        light.position.set(0, 3, 100)
        light.lookAt(0,0,0)
        light.name = "luz"
        light.castShadow = false

        const pointlight = new PointLight(0xffffff, 50000, 1000)
        pointlight.position.set(-20, 20, 100)
        pointlight.castShadow = true
        
        this._scene.add(pointlight)
        this._scene.add(light)

        const boxgeo = new BoxGeometry(1,1,20,1,1,1)
        const boxmat = new MeshStandardMaterial({color: 0xFF0000})
        const boxmesh = new Mesh(boxgeo, boxmat)
        this._scene.add(boxmesh)
        boxmesh.position.set(0,0,0)
    }

    public render = () => {
        requestAnimationFrame(this.render)
        this._renderer.render(this._scene, this._camera)
    }
}

export default GameScene