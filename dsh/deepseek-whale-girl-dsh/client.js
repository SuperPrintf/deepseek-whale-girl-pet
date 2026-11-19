/**
 * Whale girl companion — Client half.
 *
 * One registration drives two surfaces:
 *  - a `conversation.composer.dock` entry below the message composer, whose
 *    animation follows the bound Session's status;
 *  - a `conversation.hero.frame` layer that reuses the shipped `pixel-whale`
 *    id, so the blank home screen shows her instead of the pixel whale.
 *
 * The spritesheet is served by the package-asset route from `lib/assets/`;
 * `require.asset()` resolves the build-time reference the same way a compiled
 * bundle does.
 */
window.__ModuleLoader__.load({
  id: '@local/whale-girl',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace registered in `apply`. */
    const NS = 'whale-girl'
    /** Content-revisioned reference resolved by the Host's `/plugins` asset route. */
    const SPRITE = require.asset('plugins/@local/whale-girl/assets/spritesheet-9b431af19f05.webp')
    /** Spritesheet grid: 8 columns × 11 rows of 192×208 cells. */
    const COLUMNS = 8
    const ROWS = 11
    /** Local storage key holding the floating pet's normalized anchor. */
    const FLOAT_STORE_KEY = 'whale-girl.float-anchor'

    /**
     * Row and per-frame hold time for every state this bundle plays, copied
     * from the pack's `animations.json`. Row 0 column 6 is the extra neutral
     * pose and is never visited because each animation stops at its own count.
     */
    const ANIMATIONS = {
      idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
      waving: { row: 3, durations: [140, 140, 140, 280] },
      jumping: { row: 4, durations: [140, 140, 140, 140, 280] },
      waiting: { row: 6, durations: [150, 150, 150, 150, 150, 260] },
      running: { row: 7, durations: [120, 120, 120, 120, 120, 220] },
      review: { row: 8, durations: [150, 150, 150, 150, 150, 280] },
    }

    /** Plain-text UI copy; the `meta` fields in `locale/*.json` are separate. */
    const zh = {
      'pet.label': 'DeepSeek 鲸鱼娘，点一下会跳',
      'pet.hint': '拖动移动，滚轮调大小，双击复位',
      'pet.state.idle': '待机中',
      'pet.state.running': '工作中',
      'pet.state.waiting': '等你回复',
      'pet.state.review': '结果待查看',
      'pet.state.jumping': '跳一下',
      'pet.state.waving': '打招呼',
    }
    const en = {
      'pet.label': 'DeepSeek whale girl, click to make her jump',
      'pet.hint': 'Drag to move, scroll to resize, double-click to reset',
      'pet.state.idle': 'Idle',
      'pet.state.running': 'Working',
      'pet.state.waiting': 'Waiting for you',
      'pet.state.review': 'Ready to review',
      'pet.state.jumping': 'Jumping',
      'pet.state.waving': 'Saying hello',
    }

    /** Component-local stylesheet; rendered inside each component so unmounting removes it. */
    const CSS = [
      '.wg-layer{display:contents}',
      '.wg-hero{position:absolute;left:4vw;bottom:4vh;height:180px;aspect-ratio:192/208;',
      'pointer-events:none;z-index:-1;filter:drop-shadow(0 8px 14px rgba(0,0,0,.16));',
      'animation:wg-hero-in .55s ease-out both}',
      '@keyframes wg-hero-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
      '@media (max-width:1200px){.wg-hero{display:none}}',
      '@media (max-height:780px){.wg-hero{display:none}}',
      '.wg-float{position:absolute;aspect-ratio:192/208;z-index:1;',
      'transform:translate(-100%,-100%);cursor:grab;touch-action:none;user-select:none;',
      'filter:drop-shadow(0 6px 10px rgba(0,0,0,.2))}',
      '.wg-float[data-dragging=\'true\']{cursor:grabbing}',
      '.wg-dock-pet{display:block;height:44px;aspect-ratio:192/208;flex:none;margin:0;padding:0;',
      'border:0;border-radius:10px;background:none;cursor:pointer;',
      'filter:drop-shadow(0 1px 2px rgba(0,0,0,.16));transition:transform .16s ease}',
      '.wg-dock-pet:focus-visible,.wg-float:focus-visible{',
      'outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}',
      '@media (hover:hover){.wg-dock-pet:hover{transform:translateY(-2px)}}',
      '@media (prefers-reduced-motion:reduce){.wg-hero{animation:none}',
      '.wg-dock-pet{transition:none}.wg-dock-pet:hover{transform:none}}',
    ].join('')

    /** One MediaQueryList for the whole module. */
    let motionQuery
    /**
     * Shared reduced-motion source.
     * @returns the cached MediaQueryList, or null when unsupported.
     */
    function reducedMotionQuery() {
      if (motionQuery === undefined) {
        motionQuery = typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)')
          : null
      }
      return motionQuery
    }

    /**
     * Follow the reduced-motion preference, including changes while mounted.
     * @returns whether the page asks for reduced motion.
     */
    function useReducedMotion() {
      const query = reducedMotionQuery()
      const [reduced, setReduced] = React.useState(() => query !== null && query.matches)
      React.useEffect(() => {
        if (query === null) return undefined
        const onChange = (event) => { setReduced(event.matches) }
        query.addEventListener('change', onChange)
        setReduced(query.matches)
        return () => { query.removeEventListener('change', onChange) }
      }, [query])
      return reduced
    }

    /**
     * Step through one animation's frames, holding each for its own duration.
     * The returned index is 0 on the render that switches animation, so a new
     * state never paints its predecessor's frame number.
     * @param state - animation key; null parks the sprite without scheduling.
     * @param token - changes to restart the current animation from frame 0.
     * @returns the current frame index.
     */
    function useFrame(state, token) {
      const animation = state === null ? null : (ANIMATIONS[state] ?? ANIMATIONS.idle)
      const reduced = useReducedMotion()
      const [current, setCurrent] = React.useState({ animation: null, index: 0 })
      React.useEffect(() => {
        if (animation === null) return undefined
        setCurrent(previous => previous.animation === animation ? previous : { animation, index: 0 })
        if (reduced) return undefined
        let index = 0
        let timer = 0
        let alive = true
        const advance = () => {
          timer = window.setTimeout(() => {
            if (!alive) return
            index = (index + 1) % animation.durations.length
            setCurrent({ animation, index })
            advance()
          }, animation.durations[index] ?? 160)
        }
        advance()
        return () => {
          alive = false
          window.clearTimeout(timer)
        }
      }, [animation, token, reduced])
      if (animation === null) return 0
      return current.animation === animation ? current.index : 0
    }

    /**
     * Draw one spritesheet cell; percentage positions keep the cell exact at
     * any rendered size.
     * @param props.state - animation key.
     * @param props.frame - frame index within that animation.
     * @returns the sprite cell element.
     */
    function Sprite({ state, frame }) {
      const animation = ANIMATIONS[state] ?? ANIMATIONS.idle
      const column = frame % animation.durations.length
      return h('span', {
        'aria-hidden': 'true',
        style: {
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundImage: 'url("' + SPRITE + '")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: (COLUMNS * 100) + '% ' + (ROWS * 100) + '%',
          backgroundPosition: (column / (COLUMNS - 1) * 100) + '% ' + (animation.row / (ROWS - 1) * 100) + '%',
        },
      })
    }

    /**
     * Hold a one-shot animation until it finishes, then fall back to the base
     * state. Every play increments a token so replaying the same animation
     * restarts it instead of silently extending it.
     * @returns the playing one-shot entry (or null) and the trigger function.
     */
    function useOneShot() {
      const [oneShot, setOneShot] = React.useState(null)
      const token = React.useRef(0)
      const timer = React.useRef(0)
      const play = React.useCallback((name) => {
        if (ANIMATIONS[name] === undefined) return
        const total = ANIMATIONS[name].durations.reduce((sum, value) => sum + value, 0)
        token.current += 1
        window.clearTimeout(timer.current)
        setOneShot({ name, token: token.current })
        timer.current = window.setTimeout(() => { setOneShot(null) }, total)
      }, [])
      React.useEffect(() => () => window.clearTimeout(timer.current), [])
      return [oneShot, play]
    }

    /** Last-resort copy when the locale namespace is unavailable. */
    const FALLBACK_STATE_LABELS = {
      idle: '待机中',
      running: '工作中',
      waiting: '等你回复',
      review: '结果待查看',
      jumping: '跳一下',
      waving: '打招呼',
    }

    /**
     * Compose the localized accessible label for one state. A missing
     * dictionary resolves to the key itself, so fall back to literal copy
     * instead of showing `pet.state.*` to the user.
     * @param t - the slot's locale seat.
     * @param state - current animation state.
     * @returns the label text.
     */
    function labelFor(t, state) {
      const name = t('pet.label')
      const stateKey = 'pet.state.' + state
      const stateText = t(stateKey)
      const title = name === 'pet.label' ? 'DeepSeek 鲸鱼娘' : name
      const detail = stateText === stateKey
        ? (FALLBACK_STATE_LABELS[state] ?? '')
        : stateText
      return detail === '' ? title : title + ' · ' + detail
    }

    /**
     * Localized interaction hint with a literal fallback.
     * @param t - the slot's locale seat.
     * @returns the hint text.
     */
    function hintFor(t) {
      const hint = t('pet.hint')
      return hint === 'pet.hint' ? '拖动移动，滚轮调大小，双击复位' : hint
    }

    /**
     * Run one activation step without letting it break the others. A
     * re-activated plugin can meet state that outlived its first run, and a
     * throwing step must not leave the whole plugin unregistered.
     * @param step - short step name for the console warning.
     * @param run - the step body; may return a disposer.
     * @returns the step's result, or undefined when it threw.
     */
    function attempt(step, run) {
      try {
        return run()
      } catch (error) {
        console.warn('[whale-girl] activation step "' + step + '" failed:', error)
        return undefined
      }
    }

    /**
     * Dock companion: the animation follows the bound Session's status.
     * @param props.sessionId - the bound Session.
     * @param props.useSessionStatus - framework selector hook over every Session's status.
     * @param props.t - the slot's locale seat.
     * @returns the dock entry element.
     */
    function WhaleGirlDock({ sessionId, useSessionStatus, t }) {
      const status = useSessionStatus(snapshot =>
        sessionId === undefined ? undefined : snapshot.get(sessionId))
      const base = status?.pendingInteraction !== undefined
        ? 'waiting'
        : status?.running === true
          ? 'running'
          : 'idle'
      const [oneShot, play] = useOneShot()
      const wasRunning = React.useRef(false)
      // Mounting or switching Session greets once and forgets the previous
      // Session's running edge, so a switch never looks like a finished run.
      React.useEffect(() => {
        wasRunning.current = false
        play('waving')
      }, [sessionId, play])
      // A finished run is the one completion signal every Session publishes,
      // so the "result to review" reaction rides the running → stopped edge.
      React.useEffect(() => {
        const running = status?.running === true
        if (wasRunning.current && !running) play('review')
        wasRunning.current = running
      }, [status?.running, play])
      const state = oneShot === null ? base : oneShot.name
      const frame = useFrame(state, oneShot === null ? 0 : oneShot.token)
      const label = labelFor(t, state)
      return h(React.Fragment, null,
        h('style', null, CSS),
        h('button', {
          type: 'button',
          className: 'wg-dock-pet',
          'aria-label': label,
          title: label,
          onClick: () => { play('jumping') },
        }, h(Sprite, { state, frame })))
    }

    /** Interactive descendants whose clicks belong to the control, not to blank home space. */
    const CONTROLS = 'button, a, input, textarea, select, label, [contenteditable], [role="button"], [role="dialog"], [role="menu"], [role="listbox"], [data-composer-card]'

    /**
     * Classify a click as one on blank home space, following the shipped frame
     * layer's rule: primary button, inside the frame, outside any control, and
     * not ending a text selection made inside the frame.
     * @param event - the click observed on the frame.
     * @returns whether the click should play the reaction.
     */
    function isBlankClick(event) {
      const target = event.target
      const frame = event.currentTarget
      if (event.button !== 0 || !(target instanceof Element) || !frame.contains(target)) return false
      if (target.closest(CONTROLS) !== null) return false
      const selection = window.getSelection()
      if (selection === null || selection.isCollapsed) return true
      return selection.anchorNode === null || !frame.contains(selection.anchorNode)
    }

    /**
     * Home frame layer: wraps the Conversation scroll body and stands the whale
     * girl in the corner while the blank home is shown. Reusing the shipped
     * `pixel-whale` id replaces that layer instead of stacking on it.
     * @param props.hero - whether the body shows the blank home.
     * @param props.children - the wrapped scroll body.
     * @param props.t - the slot's locale seat.
     * @returns the frames around the scroll body.
     */
    function WhaleGirlHero({ hero, children, t }) {
      const [oneShot, play] = useOneShot()
      const greeted = React.useRef(false)
      React.useEffect(() => {
        if (!hero || greeted.current) return
        greeted.current = true
        play('waving')
      }, [hero, play])
      const state = hero ? (oneShot === null ? 'idle' : oneShot.name) : null
      const frame = useFrame(state, oneShot === null ? 0 : oneShot.token)
      const label = labelFor(t, state ?? 'idle')
      return h('div', {
        className: 'wg-layer',
        onClick: hero
          ? (event) => { if (isBlankClick(event)) play('jumping') }
          : undefined,
      },
      h('style', null, CSS),
      hero
        ? h('div', { className: 'wg-hero', role: 'img', 'aria-label': label, title: label },
          h(Sprite, { state: state ?? 'idle', frame }))
        : null,
      children)
    }

    /** Kicker size limits for the floating pet, in px of rendered height. */
    const FLOAT_DEFAULT_SIZE = 96
    const FLOAT_MIN_SIZE = 48
    const FLOAT_MAX_SIZE = 240

    /** Clamp one value into a range. */
    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    /**
     * Read the floating pet's saved placement and size. Older records without
     * `size` keep their position and take the default height.
     * @returns `{{ x, y, size }}` in 0..1 frame coordinates plus a px height.
     */
    function readFloatPlacement() {
      const fallback = { x: 0.97, y: 0.8, size: FLOAT_DEFAULT_SIZE }
      try {
        const raw = window.localStorage.getItem(FLOAT_STORE_KEY)
        if (raw === null) return fallback
        const parsed = JSON.parse(raw)
        if (typeof parsed !== 'object' || parsed === null) return fallback
        return {
          x: typeof parsed.x === 'number' ? clamp(parsed.x, 0.04, 0.99) : fallback.x,
          y: typeof parsed.y === 'number' ? clamp(parsed.y, 0.06, 0.99) : fallback.y,
          size: typeof parsed.size === 'number'
            ? clamp(parsed.size, FLOAT_MIN_SIZE, FLOAT_MAX_SIZE)
            : fallback.size,
        }
      } catch {
        return fallback
      }
    }

    /**
     * Frame-wide floating companion in `shell.overlay`: outside every column
     * and always visible. Drag to move, scroll to resize, double-click to
     * reset the size, click or Enter to jump. Position and size persist in
     * localStorage. Its animation follows any Session that is running or
     * waiting for the user.
     * @param props.useSessionStatus - framework selector hook over every Session's status.
     * @param props.t - the slot's locale seat.
     * @returns the floating pet element.
     */
    function WhaleGirlFloat({ useSessionStatus, t }) {
      const statuses = useSessionStatus(snapshot => snapshot)
      let waiting = false
      let running = false
      statuses.forEach((status) => {
        if (status.pendingInteraction !== undefined) waiting = true
        else if (status.running === true) running = true
      })
      const base = waiting ? 'waiting' : running ? 'running' : 'idle'
      const [oneShot, play] = useOneShot()
      const [place, setPlace] = React.useState(readFloatPlacement)
      const [dragging, setDragging] = React.useState(false)
      const latest = React.useRef(place)
      const node = React.useRef(null)
      const drag = React.useRef(null)
      const saveTimer = React.useRef(0)
      const suppressClick = React.useRef(false)
      const greeted = React.useRef(false)
      latest.current = place
      React.useEffect(() => () => window.clearTimeout(saveTimer.current), [])
      React.useEffect(() => {
        if (greeted.current) return
        greeted.current = true
        play('waving')
      }, [play])

      /** Write the latest placement now. */
      const persist = () => {
        try {
          window.localStorage.setItem(FLOAT_STORE_KEY, JSON.stringify(latest.current))
        } catch {
          // Private-mode storage failure only loses the saved placement.
        }
      }
      /** Coalesce rapid size changes into one write. */
      const schedulePersist = () => {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = window.setTimeout(persist, 250)
      }
      /** One resize step, clamped to the allowed range. */
      const resizeBy = (delta) => {
        setPlace(current => ({
          ...current,
          size: clamp(current.size + delta, FLOAT_MIN_SIZE, FLOAT_MAX_SIZE),
        }))
        schedulePersist()
      }

      // React registers wheel handlers as passive, so preventing the page
      // scroll needs a native non-passive listener on the pet itself.
      React.useEffect(() => {
        const element = node.current
        if (element === null) return undefined
        const onWheel = (event) => {
          event.preventDefault()
          resizeBy(event.deltaY > 0 ? -8 : 8)
        }
        element.addEventListener('wheel', onWheel, { passive: false })
        return () => { element.removeEventListener('wheel', onWheel) }
      }, [])

      const state = oneShot === null ? base : oneShot.name
      const frame = useFrame(state, oneShot === null ? 0 : oneShot.token)
      const label = labelFor(t, state)

      const onPointerDown = (event) => {
        if (event.button !== 0) return
        const rect = event.currentTarget.getBoundingClientRect()
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: rect.right - event.clientX,
          offsetY: rect.bottom - event.clientY,
          moved: false,
        }
        suppressClick.current = false
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(true)
      }
      const onPointerMove = (event) => {
        const current = drag.current
        if (current === null || current.pointerId !== event.pointerId) return
        if (!current.moved) {
          const traveled = Math.hypot(event.clientX - current.startX, event.clientY - current.startY)
          if (traveled < 4) return
          current.moved = true
          suppressClick.current = true
        }
        setPlace(previous => ({
          ...previous,
          x: clamp(
            (event.clientX + current.offsetX) / window.innerWidth,
            Math.min(0.99, previous.size / window.innerWidth),
            0.99,
          ),
          y: clamp(
            (event.clientY + current.offsetY) / window.innerHeight,
            Math.min(0.99, previous.size / window.innerHeight),
            0.99,
          ),
        }))
      }
      const onPointerEnd = (event) => {
        const current = drag.current
        if (current === null || current.pointerId !== event.pointerId) return
        drag.current = null
        setDragging(false)
        if (current.moved) {
          window.clearTimeout(saveTimer.current)
          persist()
        }
      }
      const activate = (event) => {
        if (suppressClick.current) return
        if (event !== undefined && event.detail > 1) return
        play('jumping')
      }
      return h('div', {
        ref: node,
        className: 'wg-float',
        role: 'button',
        tabIndex: 0,
        'aria-label': label,
        title: label + ' · ' + hintFor(t),
        'data-dragging': dragging ? 'true' : undefined,
        style: {
          left: (place.x * 100) + '%',
          top: (place.y * 100) + '%',
          height: place.size + 'px',
        },
        onClick: activate,
        onDoubleClick: (event) => {
          event.preventDefault()
          setPlace(current => ({ ...current, size: FLOAT_DEFAULT_SIZE }))
          schedulePersist()
        },
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            play('jumping')
            return
          }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            resizeBy(event.key === 'ArrowUp' ? 8 : -8)
          }
        },
        onPointerDown,
        onPointerMove,
        onPointerUp: onPointerEnd,
        onPointerCancel: onPointerEnd,
      },
      h('style', null, CSS),
      h(Sprite, { state, frame }))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        // Re-activation can meet a namespace left behind by the previous
        // instance (`register` throws on a duplicate locale); keep going so
        // the slot entries below are always installed.
        ctx.effect(
          () => attempt('locale', () => ctx.locale.register(NS, { zh, en })),
          'whale-girl: dictionaries',
        )
        ctx.slots.inject('conversation.composer.dock', () => attempt('dock entry', () =>
          ctx.slots.register({
            name: 'conversation.composer.dock',
            id: 'whale-girl',
            order: 100,
            locale: NS,
          }, WhaleGirlDock)))
        ctx.slots.inject('conversation.hero.frame', () => attempt('hero layer', () =>
          ctx.slots.register({
            name: 'conversation.hero.frame',
            id: 'pixel-whale',
            order: 0,
            locale: NS,
          }, WhaleGirlHero)))
        ctx.slots.inject('shell.overlay', () => attempt('floating pet', () =>
          ctx.slots.register({
            name: 'shell.overlay',
            id: 'whale-girl',
            order: 50,
            locale: NS,
          }, WhaleGirlFloat)))
      },
    }
  },
})
