/** CSS Modules typing for the client bundle (class map import). */
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
