


import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function CursorParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let particles = []
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Mouse Move
    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      spawnParticles(mouse.x, mouse.y)
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Particle Class
    class Particle {
      constructor(x, y) {
        this.x = x
        this.y = y
        this.radius = gsap.utils.random(1, 3)
        this.alpha = 1
        this.color = "rgba(99,102,241,1)"

        gsap.to(this, {
          x: x + gsap.utils.random(-15, 15),
          y: y + gsap.utils.random(-15, 15),
          radius: 0,
          alpha: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            particles.splice(particles.indexOf(this), 1)
          },
        })
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${this.alpha})`
        ctx.fill()
      }
    }

    function spawnParticles(x, y) {
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(x, y))
      }
    }

    // Animate Loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => p.draw())

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}