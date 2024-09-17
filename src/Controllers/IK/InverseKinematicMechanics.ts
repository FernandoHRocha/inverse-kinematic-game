import { BufferAttribute, BufferGeometry, DoubleSide, MathUtils, Mesh, MeshLambertMaterial, MeshStandardMaterial, NearestFilter, Object3D, PlaneGeometry, Raycaster, RepeatWrapping, TextureLoader, Vector2, Vector3 } from "three"
import GameScene from "../../scene/GameScene"
import InverseKinematicArm from "./InverseKinematicArm"


class InverseKinematicMechanics {

    private _gameScene: GameScene
    public arm : InverseKinematicArm

    public constructor(gameScene: GameScene) {
        this._gameScene = gameScene
        
        // addEventListener("mousedown", this.clickMouse)
        // addEventListener("mouseup", this.releaseMouse)

        this.loadObjects()
        requestAnimationFrame(this.update)
    }
    
    public loadObjects() {
        this.arm = new InverseKinematicArm(1)
        this.buildBody()
    }

    private buildBody() {
        // Carregamento da textura e criação do material
        let texLoader = new TextureLoader().load("../public/texture.png")
        texLoader.minFilter = NearestFilter
        texLoader.magFilter = NearestFilter
        texLoader.generateMipmaps = false
        texLoader.wrapS = RepeatWrapping
        texLoader.wrapT = RepeatWrapping
        const armMat = new MeshStandardMaterial({map: texLoader, side: DoubleSide})

        // Criação da geometria e associação dos vértices
        let armGeometry = new BufferGeometry()
        let faces = this.getBodyPoints()
        armGeometry.setFromPoints(faces)

        // Mapeamento UV dos vetores vértices e associação à geometria
        let attPos = armGeometry.attributes.position.array.length
        let attUv = []
        for (let i = 0; i < attPos; i++) {
            if (i % 3 === 0) {
                attUv.push(0, 0);
            } else if (i % 3 === 1) {
                attUv.push(1, 0);
            } else if (i % 3 === 2) {
                attUv.push(0, 1);
            }
        }
        armGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(attUv), 2));
        armGeometry.attributes.position.needsUpdate = true

        // Criação, configuração e adição da Mesh em cena
        const armMesh = new Mesh(armGeometry, armMat)
        armMesh.frustumCulled = false
        armMesh.castShadow = true
        armMat.flatShading = true
        this._gameScene._scene.add(armMesh)
        this.arm['mesh'] = armMesh
    }

    private getBodyPoints() {
        // Limpa a coleção de pontos e cria vetor referencia para movimento no plano XY
        let points = []
        const axis = new Vector3(0,0,1);

        // Cria os vertores para serem vértices do lado esquerdo do corpo
        for (let index = this.arm.segments.length - 1; index >= 0; index--) {
            const segment = this.arm.segments[index]
            let originDirection = segment.originDirection().setLength(segment.width)
            let crossDir = originDirection.applyAxisAngle(axis, MathUtils.degToRad(90))
            points.push(crossDir.add(segment.headPoint))
        }

        // Separa o último segmento para criar os vetores dos vértices da cabeça
        const headSegment = this.arm.segments[0]
        for(let index = 75; index >= -75; index -= 15) {
            let originDirection = headSegment.originDirection().setLength(headSegment.width)
            let crossDir = originDirection.applyAxisAngle(axis, MathUtils.degToRad(index))
            points.push(new Vector3().addVectors(crossDir, headSegment.headPoint))
        }

        // Cria os vetores para serem vértices do lado direito
        this.arm.segments.forEach(segment => {
            let originDirection = segment.originDirection().setLength(segment.width)
            let crossDir = originDirection.applyAxisAngle(axis, MathUtils.degToRad(-90))
            points.push(crossDir.add(segment.headPoint))
        })

        // Cria a associação de pontos ordenados para criar as faces
        let faces = []
        for (let index = 0; index < points.length - 1; index++) {
            faces.push(points[index]);
            faces.push(points[points.length - 1 - index])
            faces.push(points[index + 1])
        }
        return faces
    }

    public follow(target: Vector3) {
        let currentTarget = this.arm.getTarget()
        const newTarget = currentTarget.clone().lerp(target, 0.07)
        this.arm.follow(newTarget)
    }

    public update = () => {
        let points = this.getBodyPoints()
        this.arm.mesh.geometry.setFromPoints(points)
        this.arm.mesh.geometry.needsUpdate = true
        requestAnimationFrame(this.update)

    }


    // private clickMouse = (event) => {
    //     if(this._movingObject) {
    //         this._movingObject = false
    //     }

    //     // Mapeamento da posição do mouse
    //     const pointer = new Vector2()
    //     pointer.x = (event.clientX / this._gameScene._width) * 2 - 1
    //     pointer.y = -(event.clientY / this._gameScene._height) * 2 + 1
        
    //     // Criação de raycast em alvo de movimentação e adição de EventListener para atualizar o corpo
    //     const raycast = new Raycaster()
    //     raycast.setFromCamera(pointer, this._gameScene._camera)
    //     const intersects = raycast.intersectObject(this._movingPlane)
    //     if(intersects.length > 0) {
    //         this._movingObject = true
    //         addEventListener("mousemove", this.moveMouse)
    //     }
    // }

    // private moveMouse = (event) => {
    //     if(!this._movingObject) {
    //         return
    //     }

    //     // Mapeamento da posição do mouse
    //     const pointer = new Vector2()
    //     pointer.x = (event.clientX / this._gameScene._width) * 2 - 1
    //     pointer.y = -(event.clientY / this._gameScene._height) * 2 + 1
        
    //     // Criação de raycast em alvo de movimentação e função de rastreamento
    //     const raycast = new Raycaster()
    //     raycast.setFromCamera(pointer, this._gameScene._camera)
    //     const intersects = raycast.intersectObject(this._movingPlane)
    //     if(intersects.length > 0) {
    //         const targetPoint = intersects[0].point
    //         targetPoint.z = 10
    //         this.arm.follow(targetPoint)
    //     }

    //     // Atualização das posições dos vetores para atualização

    // }

    // private releaseMouse = () => {
    //     this._movingObject = false
    //     removeEventListener("mousemove", this.moveMouse);
    // }

    // public dispose = () => {
    //     removeEventListener("mousedown", this.clickMouse);
    //     removeEventListener("mousemove", this.moveMouse);
    //     removeEventListener("mouseup", this.releaseMouse);
    // }
}

export default InverseKinematicMechanics