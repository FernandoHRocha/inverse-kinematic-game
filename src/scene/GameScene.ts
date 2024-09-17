import { AmbientLight, Group, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, Vector2, Vector3, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import InverseKinematicMechanics from "../Controllers/IK/InverseKinematicMechanics"
import RenderPixelatedPass from "../postProcessing/RenderPixelatedPass"
import PixelatePass from "../postProcessing/PixelatePass"
import Player from "../Controllers/Player"
import WorldGenerate from "./WorldGenerate"

import { GUI } from 'dat.gui'

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
    private _renderResolution: Vector2
    private _composer: EffectComposer

    private _pixelate: boolean = false
    
    private _player: Player
    private _group: Group

    public constructor() {
        this._canvas = document.getElementById('gameCanvas') as HTMLElement
        this._renderer = new WebGLRenderer({
            canvas: this._canvas,
            alpha: true,
            antialias: false
        })
        this._renderer.shadowMap.enabled = true
        this._renderer.shadowMap.type = PCFSoftShadowMap
        this.setWindowSize()
        this.setDefaultScene()
        this.setRendererSize()
        this.setPostProcessing()

        addEventListener("resize", this.setRendererSize)
        this._inverseKinematicMechanics = new InverseKinematicMechanics(this)
        this._player = new Player(this._inverseKinematicMechanics)
        this.buildGui()
    }

    private buildGui() {
        const gui = new GUI()
        var props = {
            pixelate : this._pixelate,
            playerVelocity : 0
        };
        const pixelate = gui.add(props,'pixelate').name('Pixelate').listen()
        const playerVelocity  = gui.add(props, 'playerVelocity')
            .name('Velocity').max(2).min(0).step(0.1).listen()

        pixelate.onChange(value => this._pixelate = value);
        playerVelocity.onChange(value => this._player._runningDirection = new Vector3(0, value, 0))
    }

    private setWindowSize() {
        this._width = window.innerWidth
        this._height = window.innerHeight
        this._renderResolution = new Vector2(this._width, this._height).divideScalar(6)
    }
    
    private setRendererSize = () => {
        this.setWindowSize()
        this._renderer.setSize(this._width, this._height)
        this._camera.aspect = (this._width/this._height)
        this._camera.updateProjectionMatrix()
    }

    private setDefaultScene() {
        this._camera = new PerspectiveCamera(75, this._width/this._height, 0.1, 500)
        this._camera.position.set(0, 60, 150)
        this._camera.lookAt(0,100,0)
        
        this._scene = new Scene()
        window['scene'] = this._scene
    }

    public load() {
        // let controls = new OrbitControls(this._camera, this._canvas)

        this._group = new Group()
        const world = new WorldGenerate()
        this._scene.add(world.worldGroup)

        const light = new AmbientLight(0xFFFFFF, 1)
        light.castShadow = false
        this._group.add(light)

        let sunLight = new PointLight(0xffffff, 6000, 5000, 1.7)
        sunLight.position.set(-20, 180, 80)

        sunLight.castShadow = true
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 5000;
        
        this._group.add(sunLight)

        this._group.add( this._camera)
        this._scene.add(this._group)
    }

    private setPostProcessing() {
        this._composer = new EffectComposer(this._renderer)
        this._composer.addPass( new RenderPixelatedPass( this._renderResolution, this._scene, this._camera ) )
        this._composer.addPass( new PixelatePass( this._renderResolution ) )
    }

    public render = () => {
        this._group.position.add(this._player._runningDirection)
        requestAnimationFrame(this.render)
        if(this._pixelate) {
            this._composer.render()
        } else {
            this._renderer.render(this._scene, this._camera)
        }
    }

    
}

export default GameScene