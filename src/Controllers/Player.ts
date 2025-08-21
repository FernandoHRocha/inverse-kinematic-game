import { Box3, Box3Helper, Scene, Vector3 } from "three";
import InverseKinematicMechanics from "./IK/InverseKinematicMechanics";
import Segment from "./IK/Segment";
import WaterSplash from "../scene/Effects/WaterSplash";

class Player {

    private scene: Scene
    private _player: InverseKinematicMechanics
    private _playerTarget: Vector3 = new Vector3(0, 100, 20)

    private _upDirection = 13
    private _rightDirection = new Vector3(1, 0, 0)
    private _downDirection = -10
    private _leftDirection = new Vector3(-1, 0, 0)

    public _runningDirection = new Vector3(0,0.3,0)

    private _moveUp: boolean = false
    private _moveRight: boolean = false
    private _moveDown: boolean = false
    private _moveLeft: boolean = false

    private headBox = new Box3(new Vector3(), new Vector3())
    public playerHead: Segment
    private headSize = new Vector3(15,15,5)

    private waterSplashTimeout = null

    public constructor(player: InverseKinematicMechanics) {
        if( window.hasOwnProperty('scene') )
            this.scene = window['scene'] as Scene
        this._player = player
        this.playerHead = player.arm.segments[0]
        this.setupPlayer()
        addEventListener("keydown", this.onMove)
        addEventListener("keyup", this.onStop)
        requestAnimationFrame(this.update)
    }

    private setupPlayer = () => {
        this.headBox.setFromObject(this._player.arm.mesh)

        // const helper = new Box3Helper(this.headBox, 0xff0000)
        // this.scene.add(helper)
    }

    private onMove = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'w':
                this._moveUp = true
                break;

            case 'd':
                this._moveRight = true
                break;

            case 's':
                this._moveDown = true
                break;

            case 'a':
                this._moveLeft = true
                break;

            default:
                break;
        }
    }

    private onStop = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'w':
                this._moveUp = false
                break;

            case 'd':
                this._moveRight = false
                break;

            case 's':
                this._moveDown = false
                break;

            case 'a':
                this._moveLeft = false
                break;

            default:
                break;
        }
    }

    public observeWaterEntry() {
        if(this.playerHead.headPoint.z > 0 && this.playerHead.tailPoint.z < 0 ||
            this.playerHead.headPoint.z < 0 && this.playerHead.tailPoint.z > 0) {
            if(!this.waterSplashTimeout) {
                new WaterSplash(this.playerHead.headPoint)
                this.waterSplashTimeout = setTimeout(() => {
                    this.waterSplashTimeout = null
                }, 100)
            }
        }
    }

    private update = () => {

        this._playerTarget.add(this._runningDirection)

        if (this._moveRight)
            this._playerTarget.add(this._rightDirection)

        if (this._moveDown)
            this._playerTarget.z = (this._downDirection)

        if (this._moveUp)
            this._playerTarget.z = (this._upDirection)

        if(!this._moveUp && !this._moveDown)
        this._playerTarget.z = 3

        if (this._moveLeft)
            this._playerTarget.add(this._leftDirection)

        this._player.follow(this._playerTarget)
        this._player.arm.mesh.geometry.computeBoundingBox()
        this.headBox.setFromCenterAndSize(this._player.arm.segments[0].headPoint, this.headSize)
        
        this.observeWaterEntry()

        requestAnimationFrame(this.update)
    }

    public resetPosition() {
        this._playerTarget.y = 100
        this._player.arm.mesh.position.y = 100
    }
}

export default Player