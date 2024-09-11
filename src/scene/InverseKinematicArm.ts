import { MathUtils, Matrix4, Vector3 } from "three";
import Segment from "./Segment";

export default class InverseKinematicArm {

    public segments = []
    private _nailSegmentCount = 6
    private maxSegmentAngle = 30

    public constructor(segmentCount: number) {
        let segment = new Segment(this._nailSegmentCount)

        // Criação dos primeiros segmentos, começando pelo rabo
        for (let index = 0; index < this._nailSegmentCount; index++)
        {
            segment = new Segment(this._nailSegmentCount, index, this.segments[index-1] ?? null)
            this.segments.push(segment)
        }

        // Criação dos demais segmentos do corpo
        for (let index = 0; index < segmentCount; index++) {
            segment = new Segment(this._nailSegmentCount, index + this._nailSegmentCount, this.segments[this._nailSegmentCount + (index-1)] ?? null)
            this.segments.push(segment)
        }
    }

    public follow(followTarget: Vector3) {

        for(let index = this.segments.length - 1; index >= 0; index--) {
            let segment = this.segments[index]

            segment.target = followTarget
            let originDir = new Vector3().subVectors(followTarget, segment.origin).setLength(segment.segmentLength)
            segment.origin = new Vector3().subVectors(followTarget, originDir)

            if(index < this.segments.length - 1) {

                let targetDir = new Vector3().subVectors(this.segments[index + 1].target, followTarget).setLength(segment.segmentLength)
                const angle = MathUtils.radToDeg(originDir.angleTo(targetDir))

                 if(angle > this.maxSegmentAngle) {
                    let rotationAxis = new Vector3().crossVectors(originDir, targetDir).normalize();
                    let rotationMatrix = new Matrix4().makeRotationAxis(rotationAxis, MathUtils.degToRad(10));
                    originDir.applyMatrix4(rotationMatrix).normalize().setLength(segment.width);

                    let newOrigin = new Vector3().subVectors(segment.target, originDir)

                    segment.origin = newOrigin
                 }
            }

            if(segment.targetElement) {
                segment.targetElement.position.set(followTarget.x, followTarget.y, followTarget.z)
            }

            followTarget = segment.origin
        }
    }
}