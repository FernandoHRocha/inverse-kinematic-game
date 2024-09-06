import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import Segment from "./Segment";

export default class InverseKinematicArm {

    public segments = []
    public _nailSegmentCount = 3

    public constructor(segmentCount: number) {
        for (let index = 0; index < this._nailSegmentCount; index++)
        {
            if(index == 0) {
                let segment = new Segment(4)
                this.segments.push(segment)
            } else {
                let segment = new Segment(5, this.segments[index-1])
                this.segments.push(segment)
            }
        }
        for (let index = 0; index < segmentCount; index++) {
            let segment = new Segment(MathUtils.randInt(6,8), this.segments[this._nailSegmentCount + (index-1)])
            this.segments.push(segment)
            if(index == segmentCount - 1) {
                segment.buildTarget()
            }
        }
    }

    public follow(followTarget: Vector3) {

        for(let index = this.segments.length - 1; index >= 0; index--) {
            let segment = this.segments[index]

            segment.target = followTarget
            let originDir = new Vector3().subVectors(followTarget, segment.origin).setLength(segment.len)
            segment.origin = new Vector3().subVectors(followTarget, originDir)

            if(index < this.segments.length - 1) {

                let targetDir = new Vector3().subVectors(this.segments[index + 1].target, followTarget).setLength(segment.len)
                const angle = MathUtils.radToDeg(originDir.angleTo(targetDir))

                 if(angle > 40) {
                    let rotationAxis = new Vector3().crossVectors(originDir, targetDir).normalize();
                    let rotationMatrix = new Matrix4().makeRotationAxis(rotationAxis, MathUtils.degToRad(10));
                    originDir.applyMatrix4(rotationMatrix).normalize().setLength(segment.len);

                    let newOrigin = new Vector3().subVectors(segment.target, originDir)

                    segment.origin = newOrigin
                 }
            }


            segment.lineElement.geometry.setFromPoints([segment.origin, followTarget])
            segment.group.position.set(followTarget.x, followTarget.y, followTarget.z)


            const axis = new Vector3(0, 1, 0)
            const quaternion = new Quaternion().setFromUnitVectors(axis, new Vector3().subVectors(followTarget, segment.origin).normalize())
            segment.group.quaternion.copy(quaternion)

            if(segment.targetElement) {
                segment.targetElement.position.set(followTarget.x, followTarget.y, followTarget.z)
            }

            followTarget = segment.origin
        }
    }
}