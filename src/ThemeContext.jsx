import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ darkMode: true, toggle: () => {} })

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pte_theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('pte_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggle = useCallback(() => setDarkMode(d => !d), [])

  return (
    <ThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
