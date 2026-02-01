export default function compose(modules, component) {
  let tempModule = null
  for (let i = 0; i < modules.length; i++) {
    if (tempModule) {
      tempModule(modules[i])
    } else {
      tempModule = modules[i]
    }
  }
  return tempModule(component)
}
