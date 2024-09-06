import { BufferGeometry, DirectionalLight, GridHelper, Line, LineBasicMaterial, MathUtils, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, SphereGeometry, Vector3, WebGLRenderer } from "three"
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
        this._camera.position.set(0, 5, 50)
        this._camera.rotation.x = MathUtils.degToRad(0)
        this._camera.rotation.z = MathUtils.degToRad(0)
        
        this._scene = new Scene()
    }

    public async load() {
        // let controls = new OrbitControls(this._camera, this._canvas)

        const light = new DirectionalLight(0xFFFFFF, 6)
        light.position.set(0, 3, -10)
        light.name = "luz"
        light.castShadow = true
        
        this._scene.add(light)

        const helper = new GridHelper(200, 100)
        helper.position.set(0,0,1)
        helper.rotation.x = MathUtils.degToRad(90)
        // this._scene.add(helper)
    }

    public render = () => {
        requestAnimationFrame(this.render)
        this._renderer.render(this._scene, this._camera)
    }
}

export default GameScene