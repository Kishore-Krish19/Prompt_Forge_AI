let _navigator = null

export const setNavigator = (nav) => {
  _navigator = nav
}

export const Maps = (to, options) => {
  try {
    if (typeof _navigator === 'function') {
      _navigator(to, options)
    } else if (typeof window !== 'undefined') {
      window.location.href = to
    }
  } catch (e) {
    if (typeof window !== 'undefined') window.location.href = to
  }
}
