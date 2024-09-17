import { MathUtils, Matrix4, Vector3 } from "three";
import Segment from "./Segment";

export default class InverseKinematicArm {

    public mesh
    public segments = []
    private _tailSegmentCount = 4
    private maxSegmentAngle = 30

    public constructor(segmentCount: number) {
        let segment = new Segment(this._tailSegmentCount)

        // Criação dos primeiros segmentos, começando pelo rabo
        for (let index = 0; index < this._tailSegmentCount; index++)
        {
            segment = new Segment(this._tailSegmentCount, segmentCount + this._tailSegmentCount, index, this.segments[index-1] ?? null)
            this.segments.push(segment)
        }

        // Criação dos demais segmentos do corpo
        for (let index = 0; index < segmentCount; index++) {
            segment = new Segment(this._tailSegmentCount, segmentCount + this._tailSegmentCount, index + this._tailSegmentCount, this.segments[this._tailSegmentCount + (index-1)] ?? null)
            this.segments.push(segment)
        }
    }

    public getTarget(): Vector3 {
        return this.segments[0].headPoint
    }

    public follow(followTarget: Vector3) {

        this.segments.forEach(segment => {

            segment.headPoint = followTarget
            let originDir = segment.originDirection().setLength(segment.segmentLength)
            segment.tailPoint = new Vector3().subVectors(followTarget, originDir)
            let targetDirection = segment.targetDirection()
            const angle = MathUtils.radToDeg(originDir.angleTo(targetDirection))

             if(angle > this.maxSegmentAngle) {
                let rotationAxis = new Vector3().crossVectors(originDir, targetDirection).normalize();
                let rotationMatrix = new Matrix4().makeRotationAxis(rotationAxis, MathUtils.degToRad(10));
                originDir.applyMatrix4(rotationMatrix).normalize().setLength(segment.segmentLength);
                let newOrigin = new Vector3().subVectors(segment.headPoint, originDir)
                segment.tailPoint = newOrigin
             }

            followTarget = segment.tailPoint
        })
    }
}