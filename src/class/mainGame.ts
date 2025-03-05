import {
  Project,
  PhysicsLoader,
  Scene3D,
  ExtendedObject3D,
  ExtendedMesh,
  THREE,
  JoyStick,
  ThirdPersonControls,
  FirstPersonControls,
  PointerLock,
  PointerDrag
} from 'enable3d'
import { getModel } from '@/store/idbManager'

const isTouchDevice = false
const STEP_TIME = 0.05


class MainScene extends Scene3D {
  gameId!: string
  key!: string
  moveTop!: number
  moveRight!: number
  thirdPersonControls: any
  firstPersonControls: any
  man: any
  m4a1: any
  otherMan: Record<string, ExtendedObject3D> = {}
  createPlayer = false
  pl!: PointerLock
  pd!: PointerDrag
  constructor() {
    super({
      key: 'MainScene'
    })
  }

  init() {
    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2))

    this.canJump = true
    this.move = false

    this.moveTop = 0
    this.moveRight = 0
  }

  // 因为自己做了缓存 所以不需要再去预加载了
  // async preload() {
  //   /**
  //    * Medieval Fantasy Book by Pixel (https://sketchfab.com/stefan.lengyel1)
  //    * https://sketchfab.com/3d-models/medieval-fantasy-book-06d5a80a04fc4c5ab552759e9a97d91a
  //    * Attribution 4.0 International (CC BY 4.0)
  //    */

  //   /**
  //    * box_man.glb by Jan Bláha
  //    * https://github.com/swift502/Sketchbook
  //    * CC-0 license 2018
  //    */
  // }

  async create() {
    const { lights } = await this.warpSpeed('-ground', '-orbitControls')

    const { hemisphereLight, ambientLight, directionalLight } = lights
    const intensity = 1
    hemisphereLight.intensity = intensity
    ambientLight.intensity = intensity
    directionalLight.intensity = intensity

    // this.physics.debug.enable()
    const redDot = () => {
      // 如何加小红点 还不知道 先做发射
    }

    redDot()

    const addBook = async () => {
      const object = await getModel("/model/book.glb")
      // const object = await this.load.gltf('book')
      const scene = object.scenes[0]

      const book = new ExtendedObject3D()
      book.name = 'scene'
      book.add(scene)
      this.add.existing(book)

      // add animations
      // sadly only the flags animations works
      object.animations.forEach((anim, i) => {
        book.mixer = this.animationMixers.create(book)
        // overwrite the action to be an array of actions
        book.action = []
        book.action[i] = book.mixer.clipAction(anim)
        book.action[i].play()
      })

      book.traverse(child => {
        if (child.isMesh) {
          child.castShadow = child.receiveShadow = false
          child.material.metalness = 0
          child.material.roughness = 1

          if (/mesh/i.test(child.name)) {
            this.physics.add.existing(child, {
              shape: 'concave',
              mass: 0,
              collisionFlags: 1,
              autoCenter: false
            })
            child.body.setAngularFactor(0, 0, 0)
            child.body.setLinearFactor(0, 0, 0)
          }
        }
      })
    }

    const createM4a1 = async () => {
      const object = await getModel("/model/M4A1.glb")
      const m4a1 = object.scene
      m4a1.position.add(new THREE.Vector3(0, -0.23, -0.12))
      this.m4a1 = new ExtendedObject3D()
      this.m4a1.add(m4a1)
      this.add.existing(this.m4a1)
      this.m4a1.visible = false
    }

    const createBall = (pos: THREE.Vector3) => {
      const ball = this.physics.add.sphere({ radius: 0.01, mass: 10, x: pos.x, y: pos.y, z: pos.z }, { lambert: { color: 'deepskyblue' } })
      ball.body.checkCollisions = true
      return ball
    }

    const shoot = () => {
      if (this.man.userData.state === 'dead') {
        return
      }
      // 首先创建一个球
      const pos = new THREE.Vector3().copy(this.raycaster.ray.origin)
      pos.addScaledVector(this.raycaster.ray.direction, 5)
      const ball = createBall(pos)
      const power = 5000
      ball.body.applyForce(this.raycaster.ray.direction.x * power, this.raycaster.ray.direction.y * power, this.raycaster.ray.direction.z * power)
      ball.body.setCcdMotionThreshold(0.01)
      ball.body.setCcdSweptSphereRadius(0.002)
    }

    createM4a1()
    addBook()

    /**
     * Add Keys
     */
    this.keys = {
      w: { isDown: false },
      a: { isDown: false },
      s: { isDown: false },
      d: { isDown: false },
      space: { isDown: false }
    }

    const press = (e, isDown) => {
      e.preventDefault()
      const { keyCode } = e
      switch (keyCode) {
        case 87: // w
          this.keys.w.isDown = isDown
          break
        case 65: // a
          this.keys.a.isDown = isDown
          break
        case 83: // s
          this.keys.s.isDown = isDown
          break
        case 68: // d
          this.keys.d.isDown = isDown
          break
        case 38: // arrow up
          this.keys.w.isDown = isDown
          break
        case 32: // space
          this.keys.space.isDown = isDown
          break
      }
    }

    document.addEventListener('keydown', e => press(e, true))
    document.addEventListener('keyup', e => press(e, false))
    document.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.setAim(false)
      }
    })
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        // 左键
        shoot()
      }
      if (e.button === 2) {
        // 右键
        this.setAim(true)
      }
    }, true)

    // 添加其他敌人
    // this.addOtherMan(new THREE.Vector3(10, 100, 10))
    // this.addOtherMan(new THREE.Vector3(10, 100, -10))
    // this.addOtherMan(new THREE.Vector3(-10, 100, 10))
    // this.addOtherMan(new THREE.Vector3(-10, 100, -10))

    // 碰撞检测
    this.physics.collisionEvents.on('collision', data => {
      const { bodies, event } = data
      if (bodies[0].name === 'other_man' && event === 'start') {
        this.kill(bodies[0].userData.key)
      }
    })
  }

  kill(key: string) {
    // 向服务器发送击杀通知
    this.send({
      operation: 'game',
      gameOperation: 'kill',
      key: this.key,
      gameId: this.gameId,
      targetKey: key,
    })
  }

  async addMan(position, quaternion) {
    if (!position) {
      position = new THREE.Vector3(Math.random() * 10, 5, Math.random() * 10)
      quaternion = new THREE.Quaternion()
    }

    // 把这两个await 合成一个并行的await
    const [manObject, m4a1Object] = await Promise.all([
      getModel("/model/player.glb"),
      getModel("/model/M4A1.glb")
    ]);

    const man = manObject.scene.children[0]
    const m4a1 = m4a1Object.scene
    const rightHandName = 'mixamorigRightHand'
    const rightHand = man.getObjectByName(rightHandName)
    // m4a1.scale.set(0.1, 0.1, 0.1)
    m4a1.scale.set(50, 50, 50)
    m4a1.position.set(0, 20, 0) // 重置位置
    m4a1.rotation.set(Math.PI / 2, 0.2, -Math.PI / 2.2)
    rightHand?.add(m4a1)

    this.man = new ExtendedObject3D()
    this.man.name = 'man'
    this.man.rotateY(Math.PI + 0.1) // a hack
    this.man.add(man)
    // TODO:  这里应该是修改相机的旋转角度 目前是错误的
    this.man.position.set(position.x, position.y, position.z)
    this.man.quaternion.set(...quaternion)
    // add shadow
    this.man.traverse((child: ExtendedMesh) => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = false
        child.material.transparent = false
        // https://discourse.threejs.org/t/cant-export-material-from-blender-gltf/12258
        child.material.roughness = 1
        child.material.metalness = 0
      }
    })

    /**
     * Animations
     */
    // ad the box man's animation mixer to the animationMixers array (for auto updates)
    this.animationMixers.add(this.man.animation.mixer)

    manObject.animations.forEach(animation => {
      if (animation.name) {
        this.man.anims.add(animation.name, animation)
      }
    })
    this.man.anims.play('站立')

    /**
     * Add the player to the scene with a body
     */
    this.add.existing(this.man)
    this.physics.add.existing(this.man, {
      shape: 'capsule',
      // offset: {
      //   y: -0.5,
      // },
      // width: 1,
      // height: 1,
      // depth: 1,
      // radius: 0.3,
      // height: 0.4,
      // offset: { y: -0.5 }
      // height: 0.3,
    })
    this.man.body.setFriction(0.8)
    this.man.body.setAngularFactor(0, 0, 0)

    // https://docs.panda3d.org/1.10/python/programming/physics/bullet/ccd
    this.man.body.setCcdMotionThreshold(1e-7)
    this.man.body.setCcdSweptSphereRadius(0.25)

    /**
     * Add 3rd Person Controls
     */
    this.camera.position.copy(this.man.position)
    this.camera.quaternion.copy(this.man.quaternion)
    this.thirdPersonControls = new ThirdPersonControls(this.camera, this.man, {
      offset: new THREE.Vector3(0, 1, 0),
      targetRadius: 3,
    })
    this.firstPersonControls = new FirstPersonControls(this.camera, this.man, {
      offset: new THREE.Vector3(0, 1, 0),
      targetRadius: 3,
      radius: -Math.PI,
    })
    // 两个视角的相机方向是反着的 可能需要自己修正
    // set initial view to 90 deg theta
    this.thirdPersonControls.theta = 90
    this.firstPersonControls.theta = 90
    /**
     * Add Pointer Lock and Pointer Drag
     */
    if (!isTouchDevice) {
      this.pl = new PointerLock(this.canvas)
      this.pd = new PointerDrag(this.canvas)
      this.pd.onMove(delta => {
        if (this.pl.isLocked()) {
          this.moveTop = -delta.y
          this.moveRight = delta.x
        }
      })
    }
  }

  async addOtherMan(key: string, pos: THREE.Vector3) {
    const object = await getModel("/model/player.glb")
    const model = object.scene.children[0]
    // model.rotateZ(Math.PI)

    const man = new ExtendedObject3D()
    man.userData.key = key
    man.name = 'other_man'
    man.rotateY(Math.PI + 0.1) // a hack
    man.add(model)
    man.rotation.set(0, Math.PI * 1.5, 0)
    man.position.copy(pos)
    // add shadow

    this.animationMixers.add(man.animation.mixer)
    object.animations.forEach(animation => {
      if (animation.name) {
        man.anims.add(animation.name, animation)
      }
    })
    man.traverse((child: ExtendedMesh) => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = false
        // https://discourse.threejs.org/t/cant-export-material-from-blender-gltf/12258
        child.material.roughness = 1
        child.material.metalness = 0
      }
    })


    this.add.existing(man)
    this.physics.add.existing(man, {
      shape: 'capsule',
      // offset: {
      //   y: -0.5,
      // },
      // width: 1,
      // height: 1,
      // depth: 1,
      // radius: 0.3,
      // height: 0.4,
      // offset: { y: -0.5 },
      // height: 0.3,
    })

    man.body.setFriction(0.8)
    man.body.setAngularFactor(0, 0, 0)
    this.otherMan[key] = man
  }

  jump() {
    // if (!this.man || !this.canJump) return
    // this.canJump = false
    // this.man.animation.play('向前', 800, false)
    // setTimeout(() => {
    //   this.canJump = true
    //   this.man.animation.play('站立', 500)
    // }, 800)
    // this.man.body.applyForceY(55)
  }

  raycaster = new THREE.Raycaster();

  lastTime = 0
  update(time, delta) {
    if (this.man && this.man.body && this.m4a1) {

      for (const key in this.otherMan) {
        const otherMan = this.otherMan[key]
        if (otherMan.userData?.state === 'dead' && otherMan.anims.current !== '死') {
          otherMan.anims.play('死', 0, false)
        }
      }
      // 死亡
      if (this.man.userData?.state === 'dead' && this.man.anims.current !== '死') {
        this.man.anims.play('死', 0, false)
      } else {

        /**
         * Update Controls
         */
        // 神奇的东西 先更新的会失效 后更新的会生效 但是两个都要更新 不然的话 会导致相机的位置被缓存 下一次打开相机的时候的视角会是错误的
        if (this.isAim) {
          this.thirdPersonControls.update(this.moveRight * 3, -this.moveTop * 3)
          this.firstPersonControls.update(this.moveRight * 3, this.moveTop * 3)
          this.man.visible = false
          this.m4a1.visible = true
          // 这时候要更新枪的位置
          const camera = this.firstPersonControls.camera
          const pos = new THREE.Vector3().copy(camera.position)
          const quaternion = camera.quaternion
          this.m4a1.position.copy(pos)
          this.m4a1.quaternion.copy(quaternion)
        } else {
          this.firstPersonControls.update(this.moveRight * 3, this.moveTop * 3)
          this.thirdPersonControls.update(this.moveRight * 3, -this.moveTop * 3)
          this.man.visible = true
          this.m4a1.visible = false
        }
        if (!isTouchDevice) this.moveRight = this.moveTop = 0
        /**
         * Player Turn
         */
        let speed = 4
        const v3 = new THREE.Vector3()

        const rotation = this.camera.getWorldDirection(v3)
        let theta = Math.atan2(rotation.x, rotation.z)
        const rotationMan = this.man.getWorldDirection(v3)
        const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
        this.man.body.setAngularVelocityY(0)

        const l = Math.abs(theta - thetaMan)
        let rotationSpeed = isTouchDevice ? 2 : 6
        let d = Math.PI / 24

        if (l > d) {
          if (l > Math.PI - d) rotationSpeed *= -1
          if (theta < thetaMan) rotationSpeed *= -1
          this.man.body.setAngularVelocityY(rotationSpeed)
        }

        /**
         * Player Move
         */
        if (this.keys.w.isDown || this.keys.a.isDown || this.keys.s.isDown || this.keys.d.isDown || this.move) {
          // 保证同时只会按下一个按键
          // 前后左右的顺序播放动画 如果同时播放多个动画 则只取第一个
          let newAction = ''
          if (this.keys.a.isDown) {
            if (this.man.anims.current !== '向左') {
              newAction = '向左'
            } else {
              newAction = ''
            }
          }
          if (this.keys.d.isDown) {
            if (this.man.anims.current !== '向右') {
              newAction = '向右'
            } else {
              newAction = ''
            }
          }
          if (this.keys.s.isDown) {
            if (this.man.anims.current !== '向后') {
              newAction = '向后'
            } else {
              newAction = ''
            }
          }
          if (this.keys.w.isDown) {
            if (this.man.anims.current !== '向前') {
              newAction = '向前'
            } else {
              newAction = ''
            }
          }
          if (newAction) {
            this.man.anims.play(newAction)
          }

          if (this.keys.s.isDown) {
            //Backwards/diagonal movement
            speed *= -1
            if (this.keys.a.isDown) {
              theta -= Math.PI / 4
            } else if (this.keys.d.isDown) {
              theta += Math.PI / 4
            }
          } else if (this.keys.w.isDown) {
            // Forwards / Diagonal movement
            if (this.keys.a.isDown) {
              theta += Math.PI / 4
            } else if (this.keys.d.isDown) {
              theta -= Math.PI / 4
            }
          } else if (this.keys.a.isDown) {
            theta += Math.PI / 2
          } else if (this.keys.d.isDown) {
            theta -= Math.PI / 2
          }

          const x = Math.sin(theta) * speed,
            y = this.man.body.velocity.y,
            z = Math.cos(theta) * speed

          this.man.body.setVelocity(x, y, z)
        } else if (this.man.userData?.state !== 'dead' && this.man.anims.current !== '站立') {
          this.man.anims.play('站立')
        }

        /**
         * Player Jump
         */
        // if (this.keys.space.isDown && this.canJump) {
        //   this.jump()
        // }


        // 设置射线
        const pointer = new THREE.Vector2(0, 0);
        this.raycaster.setFromCamera(pointer, this.camera);
      }


      // 向服务器上报自己的位置和旋转等信息
      if (time - this.lastTime > STEP_TIME) {
        this.lastTime = time
        this.send({
          operation: 'game',
          key: this.key,
          gameId: this.gameId,
          position: this.man.position,
          quaternion: this.man.quaternion,
          animation: this.man.anims.current,
        })
      }
    }
  }

  isAim = false
  // 瞄准
  setAim(value: boolean) {
    this.isAim = value
  }

  onGameOver(game: this) {

  }

  reGame() {
    // 直接在当前位置复活
    this.send({
      operation: 'game',
      gameOperation: 'reGame',
      key: this.key,
      gameId: this.gameId,
    })

    // 播放一次站立动画
    this.man.userData.state = undefined
    // this.man.anims.play('站立')
    // 这里TS类型有错误
    this.pl.request()
  }

  // 消息相关
  send(data: any) {

  }

  onMessage(data: any) {
    // 更新其他玩家的位置
    if (data.operation === 'getPlayerData') {
      // this.otherMan[data.key] = data.pos
      const keys = Object.keys(data.playerData)
      keys.forEach(key => {
        // 检测死亡
        const state = data.playerData[key].state
        // 需要对每一个用户进行几检测 检测之后需要复活他

        if (key === this.key) {
          if (state === 'dead' && this.man) {
            if (this.man.userData?.state !== 'dead') {
              this.onGameOver(this)
            }
            this.man.userData.state = 'dead'
          } else if (this.man) {
            this.man.userData.state = undefined
          }
        } else {
          if (state === 'dead' && this.otherMan[key]) {
            this.otherMan[key].userData.state = 'dead'
          } else if (this.otherMan[key]) {
            this.otherMan[key].userData.state = undefined
          }
        }
        if (state === 'dead') {
          return
        }

        if (key !== this.key) {
          // 需要检测是不是已经存在的用户 如果不存在 则需要创建otherMan
          if (!this.otherMan[key]) {
            this.otherMan[key] = { temp: true }
            this.addOtherMan(key, new THREE.Vector3())
          }
          // 同步他们的数据
          const otherMan = this.otherMan[key]
          if (otherMan && !otherMan.temp) {
            const pos = data.playerData[key].position
            const quat = data.playerData[key].quaternion
            otherMan.body.setCollisionFlags(2)
            otherMan.position.set(pos.x, pos.y, pos.z)
            otherMan.quaternion.set(quat[0], quat[1], quat[2], quat[3])
            otherMan.body.needUpdate = true
            if (otherMan.anims.current !== data.playerData[key].animation) {
              otherMan.anims.play(data.playerData[key].animation)
            }
            // otherMan.body.once.update(() => {
            //   otherMan.body.setCollisionFlags(0)
            // })
          }
        } else {
          if (this.createPlayer === false) {
            this.createPlayer = true
            const position = data.playerData[key].position
            const quaternion = data.playerData[key].quaternion
            this.addMan(position, quaternion)
          }
        }
      })
    }
  }
}

export function createProject(option: {
  key: any,
  id: any,
  send: any,
  onMessage: any,
  containerId: any,
  onGameOver: any,
}) {
  const project = new Project({
    antialias: true,
    maxSubSteps: 10,
    fixedTimeStep: 1 / 120,
    scenes: [MainScene],
    parent: option.containerId,
  })

  const scene: any = project.scenes.get('MainScene')
  scene.send = option.send
  scene.gameId = option.id
  scene.key = option.key
  scene.onGameOver = option.onGameOver
  option.onMessage('game', (data: any) => {
    scene.onMessage(data)
  })

  option.send({
    operation: 'joinGame',
    gameId: option.id,
    key: option.key,
  })
  // 给scene注入事件 这个框架不好用
  return project

  // const resize = () => {
  //   const width = dom!.offsetWidth
  //   const height = dom!.offsetHeight
  //   console.log(width, height)
  //   project.renderer.setSize(width, height)
  //   project.camera.aspect = width / height
  //   project.camera.updateProjectionMatrix()
  // }

  // window.onresize = resize
  // resize()
}