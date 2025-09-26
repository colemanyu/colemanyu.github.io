// https://codepen.io/aphiwadchhoeun/pen/jOBbozX

let flocks = [];
const pane = new Tweakpane.Pane();
let params = {
    align: 1.2,
    cohesion: 1.5,
    separation: 1.8
};

class Particle {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.maxForce = 0.3;
        this.maxSpeed = 5;
    }
    edges() {
        if (this.position.x < 0) {
            let reflect = createVector(this.maxSpeed, this.velocity.y);
            reflect.sub(this.velocity);
            reflect.limit(this.maxForce);
            this.acceleration.add(reflect);
        } else if (this.position.x > width) {
            let reflect = createVector(-this.maxSpeed, this.velocity.y);
            reflect.sub(this.velocity);
            reflect.limit(this.maxForce);
            this.acceleration.add(reflect);
        }
        if (this.position.y < 0) {
            let reflect = createVector(this.velocity.x, this.maxSpeed);
            reflect.sub(this.velocity);
            reflect.limit(this.maxForce);
            this.acceleration.add(reflect);
        } else if (this.position.y > height) {
            let reflect = createVector(this.velocity.x, -this.maxSpeed);
            reflect.sub(this.velocity);
            reflect.limit(this.maxForce);
            this.acceleration.add(reflect);
        }
    }
    align(flocks) {
        let senseRadius = 10;
        let steering = createVector();
        let total = 0;
        for (let other of flocks) {
            if (other != this) {
                let d = this.position.dist(other.position);
                if (d <= senseRadius) {
                    steering.add(other.velocity);
                    total++;
                }
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    cohesion(flocks) {
        let senseRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of flocks) {
            if (other != this) {
                let d = this.position.dist(other.position);
                if (d <= senseRadius) {
                    steering.add(other.position);
                    total++;
                }
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    separation(flocks) {
        let senseRadius = 15;
        let steering = createVector();
        let total = 0;
        for (let other of flocks) {
            if (other != this) {
                let d = this.position.dist(other.position);
                if (d <= senseRadius) {
                    let push = p5.Vector.sub(this.position, other.position);
                    push.div(d);
                    steering.add(push);
                    total++;
                }
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    behavior(flocks) {
        let alignSteering = this.align(flocks);
        let cohesionSteering = this.cohesion(flocks);
        let separationSteering = this.separation(flocks);
        alignSteering.mult(params.align);
        cohesionSteering.mult(params.cohesion);
        separationSteering.mult(params.separation);
        this.acceleration.add(alignSteering);
        this.acceleration.add(cohesionSteering);
        this.acceleration.add(separationSteering);
    }
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }
    draw() {
        push();
        stroke('#9f5f80');
        fill('#ff8474');
        strokeWeight(2);
        let angle = atan2(this.velocity.y, this.velocity.x);
        translate(this.position.x, this.position.y);
        rotate(angle);
        quad(-15, 0, 0, -5, 5, 0, 0, 5);
        pop();
    }
}

function setup() {
    let footer = document.querySelector(".page__footer");

    // Temporarily remove min-height to get natural footer height
    let originalMinHeight = footer.style.minHeight;
    footer.style.minHeight = 'auto';

    // Get the natural dimensions
    let w = footer.offsetWidth;
    let h = footer.scrollHeight; // Use scrollHeight to get natural content height

    // Restore original min-height and set it to match natural height
    footer.style.minHeight = h + 'px';

    let canvas = createCanvas(w, h);
    canvas.parent("flock-animation"); // attach to div

    // Style the canvas to fit exactly within the footer
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('width', '100%');
    canvas.style('height', '100%');
    canvas.style('z-index', '0'); // Keep behind footer content

    // Style the flock-animation container
    let container = document.getElementById("flock-animation");
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '0';
    container.style.pointerEvents = 'none'; // Allow clicks to pass through to footer content

    // Style the footer to be positioned relative
    footer.style.position = 'relative';
    footer.style.overflow = 'hidden';

    // Position the Tweakpane control panel within the footer
    pane.element.style.position = 'absolute';
    pane.element.style.top = '10px';
    pane.element.style.right = '10px';
    pane.element.style.zIndex = '10'; // Keep above the canvas
    pane.element.style.background = 'rgba(0, 0, 0, 0.8)';
    pane.element.style.borderRadius = '8px';
    pane.element.style.padding = '5px';

    // Append the pane to the footer
    footer.appendChild(pane.element);

    pane.addInput(params, 'align', { min: 0, max: 2 });
    pane.addInput(params, 'cohesion', { min: 0, max: 2 });
    pane.addInput(params, 'separation', { min: 0, max: 2 });

    for (let i = 0; i < 100; i++) {
        flocks.push(new Particle());
    }
}

function draw() {
    clear(); // Make background transparent
    for (let p of flocks) {
        p.edges();
        p.behavior(flocks);
        p.update();
        p.draw();
    }
}

function windowResized() {
    let footer = document.querySelector(".page__footer");
    if (footer) {
        // Temporarily remove min-height to get natural footer height
        let originalMinHeight = footer.style.minHeight;
        footer.style.minHeight = 'auto';

        // Get the natural dimensions
        let w = footer.offsetWidth;
        let h = footer.scrollHeight; // Use scrollHeight to get natural content height

        // Restore min-height to match natural height
        footer.style.minHeight = h + 'px';

        resizeCanvas(w, h);
    }
}
