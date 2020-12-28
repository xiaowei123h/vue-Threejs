export function clothFunction1(x, y) {
    return Plane(x, y)
}

export function Plane(width, height) {
    return function (u, v, target) {
        const x = (u - 0.5) * width
        const y = (v + 0.5) * height
        const z = 0
        target.set(x, y, z)
    }
}

export function Cloth(w, h, MASS, THREE, restDistance, DRAG, clothFunction) {
    w = w || 10
    h = h || 10
    this.w = w
    this.h = h
    const particles = []
    const constraints = []
    // Create particles
    for (let v = 0; v <= h; v ++) {
        for (let u = 0; u <= w; u ++) {
            particles.push(
                new Particle( u / w, v / h, 0, MASS, THREE, DRAG, clothFunction )
            )
        }
    }
    // Structural
    for (let v = 0; v < h; v ++) {
        for (let u = 0; u < w; u ++) {
            constraints.push([
                particles[index(u, v)],
                particles[index(u, v + 1)],
                restDistance
            ])
            constraints.push([
                particles[index(u, v)],
                particles[index(u + 1, v)],
                restDistance
            ])
        }
    }
    for (let u = w, v = 0; v < h; v ++) {
        constraints.push([
            particles[index(u, v)],
            particles[index(u, v + 1)],
            restDistance
        ])
    }
    for (let v = h, u = 0; u < w; u ++) {

        constraints.push([
            particles[index(u, v)],
            particles[index(u + 1, v)],
            restDistance
        ])
    }

    // While many systems use shear and bend springs,
    // the relaxed constraints model seems to be just fine
    // using structural springs.
    // Shear
    // const diagonalDist = Math.sqrt(restDistance * restDistance * 2);

    // for (v=0;v<h;v++) {
    // 	for (u=0;u<w;u++) {

    // 		constraints.push([
    // 			particles[index(u, v)],
    // 			particles[index(u+1, v+1)],
    // 			diagonalDist
    // 		]);

    // 		constraints.push([
    // 			particles[index(u+1, v)],
    // 			particles[index(u, v+1)],
    // 			diagonalDist
    // 		]);

    // 	}
    // }

    this.particles = particles
    this.constraints = constraints
    function index(u, v) {
        return u + v * (w + 1)
    }
    this.index = index
}

export function Particle(x, y, z, mass, THREE, DRAG, clothFunction) {
    // console.log('x=' + x + 'y=' + y + 'z=' + z + 'mass=' + mass + 'DRAG=' + DRAG)
    this.position = new THREE.Vector3()
    this.previous = new THREE.Vector3()
    this.original = new THREE.Vector3()
    this.a = new THREE.Vector3(0, 0, 0) // acceleration
    this.mass = mass
    this.DRAG = DRAG
    this.invMass = 1 / mass
    this.tmp = new THREE.Vector3()
    this.tmp2 = new THREE.Vector3()

    // init
    clothFunction(x, y, this.position)
    clothFunction(x, y, this.previous)
    clothFunction(x, y, this.original)
}

// Force -> Acceleration
Particle.prototype.addForce = function (force) {
    this.a.add(
        this.tmp2.copy(force).multiplyScalar(this.invMass)
    )
}

// Performs Verlet integration
Particle.prototype.integrate = function (timesq) {
    const newPos = this.tmp.subVectors(this.position, this.previous)
    newPos.multiplyScalar(this.DRAG).add(this.position)
    newPos.add(this.a.multiplyScalar(timesq))
    this.tmp = this.previous
    this.previous = this.position
    this.position = newPos
    this.a.set(0, 0, 0)
}

export default {
    Cloth,
    Plane
}