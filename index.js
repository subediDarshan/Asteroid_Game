const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 5;
canvas.height = window.innerHeight - 5;

const SPEED = 3;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 3;



class Asteroid {
    constructor({position, velocity, radius}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }

}



class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.direction = 0;
    }

    draw() {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.direction);
        ctx.translate(-this.position.x, -this.position.y)
        
        

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.position.x + 30, this.position.y);
        ctx.lineTo(this.position.x - 10, this.position.y - 10) //in canvas if we want to go up, we need to minus
        ctx.lineTo(this.position.x - 10, this.position.y + 10);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.restore();

    }

    update() {

        if(key.up.pressed) {
            this.velocity.x = (SPEED)*(Math.cos(this.direction));
            this.velocity.y = (SPEED)*(Math.sin(this.direction));
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
    
        } else {
            this.velocity.x *= (FRICTION);
            this.velocity.y *= (FRICTION);
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
        
        if(key.left.pressed) {
            this.direction -= ROTATIONAL_SPEED;
            
        }
        
        if(key.right.pressed) {
            this.direction += ROTATIONAL_SPEED;
    
        }

        this.draw();

    }


    getVertices() {
        const cos = Math.cos(this.direction)
        const sin = Math.sin(this.direction)
    
        return [
          {
            x: this.position.x + cos * 30 - sin * 0,
            y: this.position.y + sin * 30 + cos * 0,
          },
          {
            x: this.position.x + cos * -10 - sin * 10,
            y: this.position.y + sin * -10 + cos * 10,
          },
          {
            x: this.position.x + cos * -10 - sin * -10,
            y: this.position.y + sin * -10 + cos * -10,
          },
        ]
      }

}


class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }


}

let projectiles = [];
let asteroids = [];



const player = new Player({
    position: {x: canvas.width / 2, y: canvas.height / 2},
    velocity: {x: 0, y: 0}
});



function circleCollision(circle1, circle2) {
    const xDiff = circle1.position.x - circle2.position.x;
    const yDiff = circle1.position.y - circle2.position.y;
    
    const diff = Math.sqrt(xDiff*xDiff + yDiff*yDiff);

    if(diff <= circle1.radius +circle2.radius) return true;

    return false;

}



let key = {
    up: {
        pressed: false
    },
    left: {
        pressed: false
    },
    right: {
        pressed: false
    }
}


const intervalId = setInterval(() => {
    let x,y,vx,vy;
    let quadrant = Math.floor(Math.random() * 4) + 1;
    let radius = Math.floor(Math.random() * 40) + 10;

    switch (quadrant) {
        case 1: // left
            x = -radius;
            y = Math.floor(Math.random()*canvas.height) + 0;
            vx = 1;
            vy = 0;
            break;
        case 2: // top
            x = Math.floor(Math.random()*canvas.width) + 0;
            y = -radius;
            vx = 0;
            vy = 1;
            break;
        case 3: // right
            x = canvas.width + radius;
            y = Math.floor(Math.random()*canvas.height) + 0;
            vx = -1;
            vy = 0;
            break;
        case 4: // bottom
            x = Math.floor(Math.random()*canvas.width) + 0;
            y = canvas.height + radius;
            vx = 0;
            vy = -1;
            break;
    
        default:
            break;
    }

    asteroids.push(new Asteroid({
        position: {
            x: x,
            y: y
        },
        velocity: {
            x: vx,
            y: vy
        },
        radius: radius
    }))

    
    



}, 1000);



function circleTriangleCollision(circle, triangle) {
    
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
      let start = triangle[i]
      let end = triangle[(i + 1) % 3]
  
      let dx = end.x - start.x
      let dy = end.y - start.y
      let length = Math.sqrt(dx * dx + dy * dy)
  
      let dot =
        ((circle.position.x - start.x) * dx +
          (circle.position.y - start.y) * dy) /
        Math.pow(length, 2)
  
      let closestX = start.x + dot * dx
      let closestY = start.y + dot * dy
  
      if (!isPointOnLineSegment(closestX, closestY, start, end)) {
        closestX = closestX < start.x ? start.x : end.x
        closestY = closestY < start.y ? start.y : end.y
      }
  
      dx = closestX - circle.position.x
      dy = closestY - circle.position.y
  
      let distance = Math.sqrt(dx * dx + dy * dy)
  
      if (distance <= circle.radius) {
        return true
      }
    }
  
    // No collision
    return false
  }


  function isPointOnLineSegment(x, y, start, end) {
    
    return (
      x >= Math.min(start.x, end.x) &&
      x <= Math.max(start.x, end.x) &&
      y >= Math.min(start.y, end.y) &&
      y <= Math.max(start.y, end.y)
    )
  }






function animate() {
    let lastFrameId = window.requestAnimationFrame(animate);

    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();

    player.update();

    for(let i = projectiles.length-1; i >= 0 ; i--) {
        let projectile = projectiles[i];
        projectile.update(); 

        if((projectile.position.x + projectile.radius < 0) ||
            (projectile.position.x - projectile.radius > canvas.width) ||
            (projectile.position.y - projectile.radius > canvas.height) ||
            (projectile.position.y + projectile.radius < 0)
        ) {
            projectiles.splice(i, 1);
        }


    }



    
    for(let i = asteroids.length-1; i >= 0 ; i--) {
        let asteroid = asteroids[i];
        asteroid.update(); 

        if(circleTriangleCollision(asteroid, player.getVertices())) {
            window.cancelAnimationFrame(lastFrameId);
            alert("Game Over");

        }

        if((asteroid.position.x + asteroid.radius < 0) ||
            (asteroid.position.x - asteroid.radius > canvas.width) ||
            (asteroid.position.y - asteroid.radius > canvas.height) ||
            (asteroid.position.y + asteroid.radius < 0)
        ) {
            asteroids.splice(i, 1);
        }

        
        for(let j = projectiles.length-1; j >= 0; j--) {
            let projectile = projectiles[j];
            if(circleCollision(asteroid, projectile)) {
                asteroids.splice(i, 1);
                projectiles.splice(j, 1);
            }
        }

    
    }

    
}

window.requestAnimationFrame(animate)



window.addEventListener('keydown', (e) => {

    switch (e.key) {
        case 'ArrowUp':
            key.up.pressed = true;
            break;
        case 'ArrowLeft':
            key.left.pressed = true;
            break;
        case 'ArrowRight':
            key.right.pressed = true;
            break;
        case ' ':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + Math.cos(player.direction) * 30, 
                    y: player.position.y + Math.sin(player.direction) * 30
                },
                velocity: {
                    x: PROJECTILE_SPEED*Math.cos(player.direction) + player.velocity.x,
                    y: PROJECTILE_SPEED*Math.sin(player.direction) + player.velocity.y
                }
            }))
            
            
            break;
        default:
            break;
    }
    
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            key.up.pressed = false;
            break;
        case 'ArrowLeft':
            key.left.pressed = false;
            break;
        case 'ArrowRight':
            key.right.pressed = false;
            break;
    
        default:
            break;
    }
    
})